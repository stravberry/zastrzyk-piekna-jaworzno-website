
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

    // Enhanced rate limiting with the new system
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseClient
      .rpc('enhanced_rate_limit_check', {
        _identifier: clientIP,
        _action: 'contact_form',
        _max_attempts: 3,
        _window_minutes: 60,
        _block_duration_minutes: 120
      });

    if (rateLimitError || !rateLimitCheck?.allowed) {
      // Log security event for rate limit exceeded
      await supabaseClient.rpc('log_security_event', {
        _event_type: 'contact_form_rate_limited',
        _severity: 'medium',
        _details: { 
          ip_address: clientIP,
          user_agent: userAgent,
          blocked_until: rateLimitCheck?.blocked_until
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Too many attempts. Please try again later.',
          blocked_until: rateLimitCheck?.blocked_until
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced server-side validation with security logging
    const errors: string[] = [];
    
    if (!formData.name || formData.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }
    
    if (!formData.email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.push('Valid email is required');
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 9) {
      errors.push('Phone number must be at least 9 digits');
    }
    
    if (!formData.subject || formData.subject.trim().length === 0) {
      errors.push('Subject is required');
    } else if (formData.subject.trim().length < 3 || formData.subject.trim().length > 200) {
      errors.push('Subject must be between 3 and 200 characters');
    }
    
    if (!formData.message || formData.message.trim().length === 0) {
      errors.push('Message is required');
    } else if (formData.message.trim().length < 10 || formData.message.trim().length > 2000) {
      errors.push('Message must be between 10 and 2000 characters');
    }
    
    if (!formData.consent_given) {
      errors.push('Consent is required');
    }

    // Check for suspicious content patterns
    const suspiciousPatterns = [
      /viagra|cialis|loan|casino|bitcoin/gi,
      /http[s]?:\/\//gi,
      /<[^>]*>/gi,
      /\b[A-Z]{10,}\b/gi,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi
    ];
    
    const allText = [formData.name, formData.email, formData.subject, formData.message].join(' ');
    const suspiciousContent = suspiciousPatterns.some(pattern => pattern.test(allText));
    
    if (suspiciousContent) {
      // Log security incident
      await supabaseClient.rpc('log_security_event', {
        _event_type: 'suspicious_contact_form',
        _severity: 'high',
        _details: { 
          ip_address: clientIP,
          user_agent: userAgent,
          form_data: {
            name_length: formData.name?.length || 0,
            subject_length: formData.subject?.length || 0,
            message_length: formData.message?.length || 0
          }
        }
      });
      
      errors.push('Content contains suspicious patterns');
    }

    if (errors.length > 0) {
      // Log validation failure
      await supabaseClient.rpc('log_security_event', {
        _event_type: 'contact_form_validation_failed',
        _severity: 'low',
        _details: { 
          ip_address: clientIP,
          user_agent: userAgent,
          errors: errors
        }
      });

      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced input sanitization
    const sanitizedData = {
      name: formData.name.trim().slice(0, 100).replace(/[<>]/g, ''),
      email: formData.email.trim().toLowerCase().slice(0, 255),
      phone: formData.phone ? formData.phone.trim().slice(0, 20).replace(/[<>]/g, '') : null,
      subject: formData.subject.trim().slice(0, 200).replace(/[<>]/g, ''),
      message: formData.message.trim().slice(0, 2000).replace(/[<>]/g, ''),
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
      
      // Log database error as security event
      await supabaseClient.rpc('log_security_event', {
        _event_type: 'contact_form_db_error',
        _severity: 'high',
        _details: { 
          ip_address: clientIP,
          user_agent: userAgent,
          error: error.message
        }
      });

      return new Response(
        JSON.stringify({ error: 'Failed to submit contact form' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful submission
    await supabaseClient.rpc('log_security_event', {
      _event_type: 'contact_form_submitted',
      _severity: 'low',
      _details: { 
        ip_address: clientIP,
        user_agent: userAgent,
        submission_id: data.id,
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
