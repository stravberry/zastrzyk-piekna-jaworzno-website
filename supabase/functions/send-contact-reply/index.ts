import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactReplyData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  original_submission_id: string;
  original_message: string;
  original_subject: string;
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

    const replyData: ContactReplyData = await req.json();
    console.log('Received reply data:', replyData);
    
    // Get client IP and user agent for logging
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    
    let clientIP = 'unknown';
    if (forwardedFor) {
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIP = realIp.trim();
    }
    
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Basic server-side validation
    const errors: string[] = [];
    
    if (!replyData.to_email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(replyData.to_email)) {
      errors.push('Nieprawidłowy adres email odbiorcy');
    }
    
    if (!replyData.subject || replyData.subject.trim().length < 1) {
      errors.push('Temat jest wymagany');
    }
    
    if (!replyData.message || replyData.message.trim().length < 1) {
      errors.push('Treść wiadomości jest wymagana');
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
      to_email: replyData.to_email.trim().toLowerCase(),
      to_name: replyData.to_name.trim(),
      subject: replyData.subject.trim(),
      message: replyData.message.trim(),
      original_submission_id: replyData.original_submission_id,
      original_message: replyData.original_message.trim(),
      original_subject: replyData.original_subject.trim()
    };

    console.log('Sanitized reply data:', sanitizedData);

    // Save the reply to database for history
    const { data: replyRecord, error: dbError } = await supabaseClient
      .from('contact_replies')
      .insert([{
        original_submission_id: sanitizedData.original_submission_id,
        to_email: sanitizedData.to_email,
        to_name: sanitizedData.to_name,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        sent_by_ip: clientIP,
        sent_by_user_agent: userAgent
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with email sending even if database save fails
    } else {
      console.log('Reply saved to database:', replyRecord);
    }

    // Send the reply email
    try {
      const emailResult = await resend.emails.send({
        from: 'Zastrzyk Piękna <noreply@zastrzykpiekna.eu>',
        to: [sanitizedData.to_email],
        subject: sanitizedData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Odpowiedź na Twoją wiadomość</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e91e63; margin: 20px 0;">
              ${sanitizedData.message.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <div style="font-size: 14px; color: #666;">
              <p><strong>Twoja oryginalna wiadomość:</strong></p>
              <p><strong>Temat:</strong> ${sanitizedData.original_subject}</p>
              <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${sanitizedData.original_message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>Zastrzyk Piękna<br>
              Grunwaldzka 106, 43-600 Jaworzno<br>
              Tel: 514 902 242</p>
            </div>
          </div>
        `,
      });

      console.log('Email sent successfully:', emailResult);
      
      // Update the reply record with email ID if available
      if (replyRecord && emailResult.data?.id) {
        await supabaseClient
          .from('contact_replies')
          .update({ email_id: emailResult.data.id, sent_at: new Date().toISOString() })
          .eq('id', replyRecord.id);
      }

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return new Response(
        JSON.stringify({ error: 'Błąd wysyłania emaila' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful reply
    await supabaseClient.rpc('log_security_event', {
      _event_type: 'contact_reply_sent',
      _severity: 'low',
      _details: { 
        ip_address: clientIP,
        user_agent: userAgent,
        original_submission_id: sanitizedData.original_submission_id,
        to_email: sanitizedData.to_email,
        subject: sanitizedData.subject
      }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Odpowiedź została wysłana pomyślnie!' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact reply error:', error);
    return new Response(
      JSON.stringify({ error: 'Błąd serwera' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});