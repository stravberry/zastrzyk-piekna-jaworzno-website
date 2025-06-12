
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  templateName: string;
  recipientEmail: string;
  testData: {
    patient_name: string;
    date: string;
    time: string;
    treatment_name: string;
    duration: string;
    pre_treatment_notes?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Test email function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { templateName, recipientEmail, testData }: TestEmailRequest = await req.json();
    console.log('Test email request:', { templateName, recipientEmail });

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error('Nieprawidłowy adres email');
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error('Nie znaleziono szablonu email');
    }

    // Process template content
    const processTemplate = (content: string, data: any) => {
      let processed = content;
      
      // Replace variables
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(regex, value as string);
      });
      
      // Handle conditional statements
      processed = processed.replace(
        /\{\{#if pre_treatment_notes\}\}(.*?)\{\{\/if\}\}/gs,
        data.pre_treatment_notes ? '$1' : ''
      );
      
      return processed;
    };

    const processedSubject = processTemplate(template.subject, testData);
    const processedHtmlContent = processTemplate(template.html_content, testData);
    const processedTextContent = processTemplate(template.text_content || '', testData);

    // Determine recipient and subject based on email restrictions
    const verifiedEmail = 'zastrzykpiekna.kontakt@gmail.com';
    
    let recipient = recipientEmail;
    let finalSubject = `[TEST] ${processedSubject}`;
    
    // If recipient email is not the verified one, send to verified email with modified subject
    if (recipientEmail !== verifiedEmail) {
      recipient = verifiedEmail;
      finalSubject = `[TEST - Dla: ${recipientEmail}] ${processedSubject}`;
      console.log(`Sending to verified email due to Resend restrictions. Original recipient: ${recipientEmail}`);
    }

    // Send test email
    const emailResponse = await resend.emails.send({
      from: "Zastrzyk Piękna <zastrzykpiekna.kontakt@gmail.com>",
      to: [recipient],
      subject: finalSubject,
      html: processedHtmlContent,
      text: processedTextContent || undefined,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      
      // Handle specific Resend errors
      if (emailResponse.error.message?.includes('validation_error')) {
        throw new Error(`Błąd walidacji email: ${emailResponse.error.message}`);
      } else if (emailResponse.error.message?.includes('domain')) {
        throw new Error(`Błąd domeny: ${emailResponse.error.message}. Sprawdź konfigurację domeny w Resend.`);
      } else {
        throw new Error(`Błąd wysyłania: ${emailResponse.error.message}`);
      }
    }

    console.log('Test email sent successfully:', emailResponse.data?.id);
    console.log('Sent to:', recipient, 'Original recipient:', recipientEmail);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
        message: recipient === recipientEmail 
          ? 'Email testowy został wysłany pomyślnie' 
          : `Email testowy wysłany na adres testowy (${verifiedEmail}) - oryginalny odbiorca: ${recipientEmail}`,
        sentTo: recipient,
        originalRecipient: recipientEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in test-email-template function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Wystąpił nieoczekiwany błąd'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
