
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, validateEmail, validatePhone } from "./securityService";

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

// Secure contact form submission
export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Client-side validation and sanitization
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email).toLowerCase(),
      phone: formData.phone ? sanitizeInput(formData.phone) : undefined,
      subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message),
      consent_given: formData.consent_given
    };

    // Additional validation
    if (!validateEmail(sanitizedData.email)) {
      throw new Error('Invalid email address');
    }

    if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
      throw new Error('Invalid phone number');
    }

    if (!sanitizedData.name || sanitizedData.name.length === 0) {
      throw new Error('Name is required');
    }

    if (!sanitizedData.subject || sanitizedData.subject.length === 0) {
      throw new Error('Subject is required');
    }

    if (!sanitizedData.message || sanitizedData.message.length === 0) {
      throw new Error('Message is required');
    }

    if (!sanitizedData.consent_given) {
      throw new Error('Consent is required');
    }

    // Call the secure edge function
    const { data, error } = await supabase.functions.invoke('submit-contact-form', {
      body: sanitizedData
    });

    if (error) {
      console.error('Contact form submission error:', error);
      throw new Error('Failed to submit contact form');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to submit contact form');
    }

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact form error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An error occurred while sending your message'
    };
  }
};

// Admin function to get contact submissions
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
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
    throw error;
  }
};

// Admin function to update contact submission status
export const updateContactStatus = async (id: string, status: 'new' | 'reviewed' | 'responded'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update contact status:', error);
    throw error;
  }
};
