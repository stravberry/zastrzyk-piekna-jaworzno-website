import { supabase } from "@/integrations/supabase/client";
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  logSecurityEvent
} from "./securityService";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent_given: boolean;
}

export interface ContactSubmission extends ContactFormData {
  id: string;
  ip_address?: string;
  user_agent?: string;
  status: 'new' | 'reviewed' | 'responded';
  created_at: string;
  updated_at: string;
}

// Simplified contact form submission - no rate limiting, minimal security checks
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Basic client-side validation and sanitization
    const sanitizedData = {
      name: sanitizeInput(formData.name, 'contact_name'),
      email: sanitizeInput(formData.email, 'contact_email').toLowerCase(),
      phone: formData.phone ? sanitizeInput(formData.phone, 'contact_phone') : undefined,
      subject: sanitizeInput(formData.subject, 'contact_subject'),
      message: sanitizeInput(formData.message, 'contact_message'),
      consent_given: formData.consent_given
    };

    // Basic validation only
    if (!validateEmail(sanitizedData.email)) {
      throw new Error('Nieprawidłowy adres email');
    }

    if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
      throw new Error('Nieprawidłowy numer telefonu');
    }

    if (!sanitizedData.name || sanitizedData.name.length < 2) {
      throw new Error('Imię musi mieć co najmniej 2 znaki');
    }

    if (!sanitizedData.subject || sanitizedData.subject.length < 3) {
      throw new Error('Temat musi mieć co najmniej 3 znaki');
    }

    if (!sanitizedData.message || sanitizedData.message.length < 10) {
      throw new Error('Wiadomość musi mieć co najmniej 10 znaków');
    }

    if (!sanitizedData.consent_given) {
      throw new Error('Zgoda jest wymagana');
    }

    // Log attempt (optional)
    await logSecurityEvent('contact_form_attempt', 'low', {
      form_data: {
        name_length: sanitizedData.name.length,
        subject_length: sanitizedData.subject.length,
        message_length: sanitizedData.message.length,
        has_phone: !!sanitizedData.phone
      }
    });

    // Call the edge function directly without any rate limiting
    const { data, error } = await supabase.functions.invoke('submit-contact-form', {
      body: sanitizedData
    });

    if (error) {
      console.error('Contact form submission error:', error);
      throw new Error('Błąd wysyłania');
    }

    if (!data.success) {
      throw new Error(data.error || 'Błąd wysyłania');
    }

    // Log success
    await logSecurityEvent('contact_form_submitted_success', 'low', {
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'Wiadomość została wysłana pomyślnie!' };
  } catch (error) {
    console.error('Contact form error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Błąd wysyłania'
    };
  }
};

// Admin function to get contact submissions with security logging
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    await logSecurityEvent('contact_submissions_accessed', 'low', {
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our interface, handling the ip_address type properly
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      subject: item.subject,
      message: item.message,
      consent_given: item.consent_given,
      ip_address: item.ip_address ? String(item.ip_address) : undefined,
      user_agent: item.user_agent,
      status: item.status as 'new' | 'reviewed' | 'responded',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    
    await logSecurityEvent('contact_submissions_fetch_error', 'medium', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};

export const updateContactStatus = async (id: string, status: 'new' | 'reviewed' | 'responded'): Promise<void> => {
  try {
    await logSecurityEvent('contact_status_update', 'low', {
      submission_id: id,
      new_status: status,
      timestamp: new Date().toISOString()
    });

    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await logSecurityEvent('contact_status_updated_success', 'low', {
      submission_id: id,
      status: status
    });
  } catch (error) {
    console.error('Failed to update contact status:', error);
    
    await logSecurityEvent('contact_status_update_error', 'medium', {
      submission_id: id,
      status: status,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};
