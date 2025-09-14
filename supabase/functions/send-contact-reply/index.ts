import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase and Resend clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY secret');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    const resend = new Resend(resendApiKey);

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Parse request data
    const replyData: ContactReplyData = await req.json();
    
    // Extract client info for logging
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Forwarded-For') || 
                     req.headers.get('X-Real-IP') || 
                     'unknown';
    const userAgent = req.headers.get('User-Agent') || 'unknown';

    console.log('Received reply data:', {
      to_email: replyData.to_email,
      subject: replyData.subject,
      original_submission_id: replyData.original_submission_id
    });

    // Basic server-side validation
    if (!replyData.to_email || !replyData.subject || !replyData.message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(replyData.to_email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      to_email: replyData.to_email.trim().toLowerCase(),
      to_name: replyData.to_name?.trim() || '',
      subject: replyData.subject.trim(),
      message: replyData.message.trim(),
      original_submission_id: replyData.original_submission_id,
      original_message: replyData.original_message?.trim() || '',
      original_subject: replyData.original_subject?.trim() || ''
    };

    // Insert reply record into database
    const { data: replyRecord, error: dbError } = await supabaseClient
      .from('contact_replies')
      .insert({
        original_submission_id: sanitizedData.original_submission_id,
        to_email: sanitizedData.to_email,
        to_name: sanitizedData.to_name,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        sent_by_ip: clientIP !== 'unknown' ? clientIP : null,
        sent_by_user_agent: userAgent
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Reply record created:', replyRecord);

    // Prepare email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
            .original-message { background: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin-top: 20px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Odpowiedź na Twoją wiadomość</h2>
            </div>
            <div class="content">
              <p>Dzień dobry ${sanitizedData.to_name},</p>
              
              <div style="white-space: pre-wrap; margin: 20px 0;">${sanitizedData.message}</div>
              
              <div class="original-message">
                <h4>Twoja oryginalna wiadomość:</h4>
                <p><strong>Temat:</strong> ${sanitizedData.original_subject}</p>
                <div style="white-space: pre-wrap; margin-top: 10px;">${sanitizedData.original_message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Pozdrawiamy,<br>Zespół Zastrzyk Piękna</p>
              <p><em>Ta wiadomość została wysłana w odpowiedzi na Twoją wiadomość z formularza kontaktowego.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Zastrzyk Piękna <noreply@zastrzykpiekna.eu>',
      to: [sanitizedData.to_email],
      reply_to: 'zastrzykpiekna.kontakt@gmail.com',
      subject: sanitizedData.subject,
      html: htmlContent,
      text: `${sanitizedData.message}\n\n---\nTwoja oryginalna wiadomość:\nTemat: ${sanitizedData.original_subject}\n${sanitizedData.original_message}`
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      
      // Log error but don't fail completely - record is already in DB
      await supabaseClient
        .rpc('log_security_event', {
          _event_type: 'contact_reply_email_failed',
          _severity: 'high',
          _details: {
            error: emailError.message,
            reply_id: replyRecord.id,
            to_email: sanitizedData.to_email
          }
        });

      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Email sent successfully:', emailData);

    // Update database record with email ID and sent timestamp
    await supabaseClient
      .from('contact_replies')
      .update({
        email_id: emailData?.id,
        sent_at: new Date().toISOString()
      })
      .eq('id', replyRecord.id);

    // Log successful reply
    await supabaseClient
      .rpc('log_security_event', {
        _event_type: 'contact_reply_sent',
        _severity: 'medium',
        _details: {
          reply_id: replyRecord.id,
          to_email: sanitizedData.to_email,
          email_id: emailData?.id
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply_id: replyRecord.id,
        email_id: emailData?.id 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in send-contact-reply function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});