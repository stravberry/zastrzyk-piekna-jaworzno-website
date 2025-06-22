
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
    console.log('Received form data:', formData);
    
    // Get client IP and user agent for logging only
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    
    let clientIP = 'unknown';
    if (forwardedFor) {
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIP = realIp.trim();
    }
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    console.log('Client IP extracted:', clientIP);

    // NO RATE LIMITING - proceed directly to validation

    // Basic server-side validation only
    const errors: string[] = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Imię jest wymagane (min. 2 znaki)');
    }
    
    if (!formData.email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.push('Prawidłowy email jest wymagany');
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 9) {
      errors.push('Numer telefonu musi mieć co najmniej 9 cyfr');
    }
    
    if (!formData.subject || formData.subject.trim().length < 3) {
      errors.push('Temat jest wymagany (min. 3 znaki)');
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
      errors.push('Wiadomość jest wymagana (min. 10 znaków)');
    }
    
    if (!formData.consent_given) {
      errors.push('Zgoda jest wymagana');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return new Response(
        JSON.stringify({ error: 'Błędy walidacji', details: errors }),
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

    console.log('Sanitized data:', sanitizedData);

    // Insert contact submission into database
    const { data: submissionData, error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert([sanitizedData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Błąd bazy danych' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Contact submission saved:', submissionData);

    // Send email notification to clinic
    try {
      const emailResult = await resend.emails.send({
        from: 'Formularz kontaktowy <noreply@zastrzykpiekna.pl>',
        to: ['zastrzykpiekna.kontakt@gmail.com'],
        subject: `Nowa wiadomość: ${sanitizedData.subject}`,
        html: `
          <h2>Nowa wiadomość z formularza kontaktowego</h2>
          <p><strong>Imię i nazwisko:</strong> ${sanitizedData.name}</p>
          <p><strong>Email:</strong> ${sanitizedData.email}</p>
          ${sanitizedData.phone ? `<p><strong>Telefon:</strong> ${sanitizedData.phone}</p>` : ''}
          <p><strong>Temat:</strong> ${sanitizedData.subject}</p>
          <p><strong>Wiadomość:</strong></p>
          <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>IP: ${clientIP} | User Agent: ${userAgent}</small></p>
        `,
      });

      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue without failing the request - the form submission was saved
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'Zastrzyk Piękna <noreply@zastrzykpiekna.pl>',
        to: [sanitizedData.email],
        subject: 'Potwierdzenie otrzymania wiadomości',
        html: `
          <h2>Dziękujemy za kontakt!</h2>
          <p>Cześć ${sanitizedData.name},</p>
          <p>Otrzymaliśmy Twoją wiadomość i skontaktujemy się z Tobą tak szybko, jak to możliwe.</p>
          <p><strong>Temat Twojej wiadomości:</strong> ${sanitizedData.subject}</p>
          <br>
          <p>Pozdrawiamy,<br>Zespół Zastrzyk Piękna</p>
          <hr>
          <p><small>Grunwaldzka 106, 43-600 Jaworzno<br>Tel: 514 902 242</small></p>
        `,
      });
    } catch (confirmEmailError) {
      console.error('Confirmation email failed:', confirmEmailError);
      // Continue without failing - this is not critical
    }

    // Log successful submission (optional)
    await supabaseClient.rpc('log_security_event', {
      _event_type: 'contact_form_submitted',
      _severity: 'low',
      _details: { 
        ip_address: clientIP,
        user_agent: userAgent,
        submission_id: submissionData.id,
        form_data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject
        }
      }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Wiadomość została wysłana pomyślnie!' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Błąd serwera' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
