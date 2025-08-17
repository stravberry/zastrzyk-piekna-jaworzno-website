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
}

export interface ContactSubmission extends ContactFormData {
  id: string;
  ip_address?: string;
  user_agent?: string;
  status: 'new' | 'reviewed' | 'responded';
  created_at: string;
  updated_at: string;
}

// Enhanced secure contact form submission with encryption and advanced rate limiting
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

    // Use the secure database function for submission
    const { data, error } = await supabase.rpc('submit_contact_secure', {
      _name: sanitizedData.name,
      _email: sanitizedData.email,
      _phone: sanitizedData.phone,
      _subject: sanitizedData.subject,
      _message: sanitizedData.message,
      _consent_given: sanitizedData.consent_given,
      _ip_address: null, // Would get from request context in real app
      _user_agent: navigator.userAgent
    });

    if (error) {
      secureLogger.error('Secure contact submission error:', error);
      throw new Error('Błąd wysyłania formularza');
    }

    const result = data as { success: boolean; error?: string };
    if (!result?.success) {
      throw new Error(result?.error || 'Błąd wysyłania');
    }

    return { success: true, message: 'Wiadomość została wysłana pomyślnie i zaszyfrowana!' };
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
