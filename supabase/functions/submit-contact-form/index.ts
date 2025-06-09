
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent_given: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const formData: ContactFormData = await req.json();
    
    // Get client IP and user agent for security tracking
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseClient
      .rpc('check_rate_limit', {
        _identifier: clientIP,
        _action: 'contact_form',
        _max_attempts: 3,
        _window_minutes: 60
      });

    if (rateLimitError || !rateLimitCheck) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Server-side validation
    const errors: string[] = [];
    
    if (!formData.name || formData.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!formData.email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.push('Valid email is required');
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 9) {
      errors.push('Phone number must be at least 9 digits');
    }
    
    if (!formData.subject || formData.subject.trim().length === 0) {
      errors.push('Subject is required');
    }
    
    if (!formData.message || formData.message.trim().length === 0) {
      errors.push('Message is required');
    }
    
    if (!formData.consent_given) {
      errors.push('Consent is required');
    }

    // Input length validation
    if (formData.name && formData.name.length > 100) {
      errors.push('Name is too long');
    }
    
    if (formData.subject && formData.subject.length > 200) {
      errors.push('Subject is too long');
    }
    
    if (formData.message && formData.message.length > 2000) {
      errors.push('Message is too long');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: formData.name.trim().slice(0, 100),
      email: formData.email.trim().toLowerCase().slice(0, 255),
      phone: formData.phone ? formData.phone.trim().slice(0, 20) : null,
      subject: formData.subject.trim().slice(0, 200),
      message: formData.message.trim().slice(0, 2000),
      consent_given: formData.consent_given,
      ip_address: clientIP,
      user_agent: userAgent
    };

    // Insert contact submission
    const { data, error } = await supabaseClient
      .from('contact_submissions')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact form' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log security event
    await supabaseClient.rpc('log_admin_activity', {
      _action: 'contact_form_submitted',
      _resource_type: 'security',
      _resource_id: data.id,
      _details: { 
        ip_address: clientIP,
        user_agent: userAgent,
        form_data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject
        }
      }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Contact form submitted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
