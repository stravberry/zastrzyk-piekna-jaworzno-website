import { supabase } from "@/integrations/supabase/client";
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  logSecurityEvent,
  detectSuspiciousActivity
} from "./securityService";
import { secureLogger } from "@/utils/secureLogger";
import { InputSecurityValidator } from "@/utils/inputSecurity";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent_given: boolean;
  honeypot?: string; // Security honeypot field
}

export interface ContactSubmission extends ContactFormData {
  id: string;
  ip_address?: string;
  user_agent?: string;
  status: 'new' | 'reviewed' | 'responded';
  created_at: string;
  updated_at: string;
}

// Enhanced secure contact form submission using edge function
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Enhanced input validation and sanitization
    const sanitizedData = {
      name: sanitizeInput(formData.name, 'general'),
      email: sanitizeInput(formData.email, 'email').toLowerCase(),
      phone: formData.phone ? sanitizeInput(formData.phone, 'general') : undefined,
      subject: sanitizeInput(formData.subject, 'general'),
      message: sanitizeInput(formData.message, 'general'),
      consent_given: formData.consent_given
    };

    // Check for suspicious activity before processing
    if (detectSuspiciousActivity(sanitizedData, 'contact_form')) {
      throw new Error('Nieprawidłowe dane w formularzu');
    }

    // Enhanced validation
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

    // Check for malicious content
    const maliciousPatterns = ['<script', 'javascript:', 'onclick', 'onerror', 'onload'];
    const allText = `${sanitizedData.name} ${sanitizedData.subject} ${sanitizedData.message}`.toLowerCase();
    if (maliciousPatterns.some(pattern => allText.includes(pattern))) {
      throw new Error('Wykryto podejrzaną zawartość');
    }

    // Use the edge function for submission (bypasses encryption/validation conflict)
    const { data, error } = await supabase.functions.invoke('submit-contact-form', {
      body: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        consent_given: sanitizedData.consent_given
      }
    });

    if (error) {
      secureLogger.error('Contact form submission error:', error);
      throw new Error('Błąd wysyłania formularza');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Błąd wysyłania formularza');
    }

    return { success: true, message: 'Wiadomość została wysłana pomyślnie!' };
  } catch (error) {
    secureLogger.error('Contact form error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Błąd wysyłania'
    };
  }
};

// Secure admin function to get contact submissions with decryption and enhanced logging
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    // Use the secure database function for retrieving contact data
    const { data, error } = await supabase.rpc('get_contact_submissions_secure');

    if (error) {
      secureLogger.error('Failed to fetch secure contact submissions:', error);
      throw error;
    }
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      subject: item.subject,
      message: item.message,
      consent_given: item.consent_given,
      ip_address: item.ip_address, // Already anonymized by the function
      user_agent: item.user_agent, // Already truncated by the function
      status: item.status as 'new' | 'reviewed' | 'responded',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    secureLogger.error('Failed to fetch secure contact submissions:', error);
    
    await logSecurityEvent('contact_submissions_fetch_error', 'high', {
      error: error instanceof Error ? error.message : 'Unknown error',
      admin_user: 'current_admin'
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
    secureLogger.error('Failed to update contact status:', error);
    
    await logSecurityEvent('contact_status_update_error', 'medium', {
      submission_id: id,
      status: status,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};
