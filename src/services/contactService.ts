
import { supabase } from "@/integrations/supabase/client";
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  detectSuspiciousActivity,
  logSecurityEvent,
  checkRateLimit
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

// Enhanced secure contact form submission
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Client-side rate limiting check
    const userIdentifier = `contact_form_${window.location.hostname}`;
    const rateLimitResult = await checkRateLimit(userIdentifier, 'contact_form_client', 3, 60);
    
    if (!rateLimitResult.allowed) {
      await logSecurityEvent('contact_form_rate_limited_client', 'medium', {
        blocked_until: rateLimitResult.blockedUntil,
        reason: rateLimitResult.reason
      });
      
      return {
        success: false,
        message: 'Too many submissions. Please wait before trying again.'
      };
    }

    // Enhanced client-side validation and sanitization
    const sanitizedData = {
      name: sanitizeInput(formData.name, 'contact_name'),
      email: sanitizeInput(formData.email, 'contact_email').toLowerCase(),
      phone: formData.phone ? sanitizeInput(formData.phone, 'contact_phone') : undefined,
      subject: sanitizeInput(formData.subject, 'contact_subject'),
      message: sanitizeInput(formData.message, 'contact_message'),
      consent_given: formData.consent_given
    };

    // Enhanced validation with security logging
    if (!validateEmail(sanitizedData.email)) {
      await logSecurityEvent('invalid_email_contact_form', 'low', {
        email_format: sanitizedData.email.substring(0, 10) + '...'
      });
      throw new Error('Invalid email address');
    }

    if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
      await logSecurityEvent('invalid_phone_contact_form', 'low', {
        phone_length: sanitizedData.phone.length
      });
      throw new Error('Invalid phone number');
    }

    if (!sanitizedData.name || sanitizedData.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!sanitizedData.subject || sanitizedData.subject.length < 3) {
      throw new Error('Subject must be at least 3 characters');
    }

    if (!sanitizedData.message || sanitizedData.message.length < 10) {
      throw new Error('Message must be at least 10 characters');
    }

    if (!sanitizedData.consent_given) {
      throw new Error('Consent is required');
    }

    // Check for suspicious activity
    if (detectSuspiciousActivity(sanitizedData, 'contact_form')) {
      return {
        success: false,
        message: 'Your submission contains content that cannot be processed. Please review and try again.'
      };
    }

    // Log form submission attempt
    await logSecurityEvent('contact_form_attempt', 'low', {
      form_data: {
        name_length: sanitizedData.name.length,
        subject_length: sanitizedData.subject.length,
        message_length: sanitizedData.message.length,
        has_phone: !!sanitizedData.phone
      }
    });

    // Call the secure edge function
    const { data, error } = await supabase.functions.invoke('submit-contact-form', {
      body: sanitizedData
    });

    if (error) {
      console.error('Contact form submission error:', error);
      
      await logSecurityEvent('contact_form_submission_error', 'medium', {
        error: error.message
      });
      
      throw new Error('Failed to submit contact form');
    }

    if (!data.success) {
      await logSecurityEvent('contact_form_submission_failed', 'medium', {
        error: data.error
      });
      
      throw new Error(data.error || 'Failed to submit contact form');
    }

    // Log successful submission
    await logSecurityEvent('contact_form_submitted_success', 'low', {
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact form error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred while sending your message'
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

// Admin function to update contact submission status with security logging
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
