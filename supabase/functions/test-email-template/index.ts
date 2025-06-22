
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
  console.log('Test email function called - START');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      throw new Error('Brak klucza API Resend - skonfiguruj RESEND_API_KEY w ustawieniach');
    }

    console.log('RESEND_API_KEY found, initializing Resend client');
    const resend = new Resend(resendApiKey);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { templateName, recipientEmail, testData }: TestEmailRequest = await req.json();
    console.log('Test email request received:', { templateName, recipientEmail });

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.error('Invalid email format:', recipientEmail);
      throw new Error('Nieprawidłowy adres email');
    }

    // Get email template
    console.log('Fetching template from database:', templateName);
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single();

    if (templateError) {
      console.error('Template database error:', templateError);
      throw new Error('Błąd podczas pobierania szablonu z bazy danych');
    }

    if (!template) {
      console.error('Template not found:', templateName);
      throw new Error('Nie znaleziono szablonu email');
    }

    console.log('Template found:', template.name, template.subject);

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

    console.log('Template processing completed');
    console.log('Processed subject:', processedSubject);

    // Send test email - try with verified domain first, then fallback to default
    console.log('Attempting to send email...');
    
    let emailResponse;
    try {
      // Try with custom domain first
      emailResponse = await resend.emails.send({
        from: "Zastrzyk Piękna <noreply@zastrzykpiekna.eu>",
        to: [recipientEmail],
        reply_to: "zastrzykpiekna.kontakt@gmail.com",
        subject: `[TEST] ${processedSubject}`,
        html: processedHtmlContent,
        text: processedTextContent || undefined,
      });
      console.log('Email sent with custom domain successfully');
    } catch (domainError: any) {
      console.log('Custom domain failed, trying with Resend default domain:', domainError.message);
      
      // Fallback to resend default domain
      emailResponse = await resend.emails.send({
        from: "Zastrzyk Piękna <onboarding@resend.dev>",
        to: [recipientEmail],
        reply_to: "zastrzykpiekna.kontakt@gmail.com",
        subject: `[TEST] ${processedSubject}`,
        html: processedHtmlContent,
        text: processedTextContent || undefined,
      });
      console.log('Email sent with default domain successfully');
    }

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      throw new Error(`Błąd wysyłania: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);
    console.log('Sent to:', recipientEmail);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
        message: 'Email testowy został wysłany pomyślnie',
        sentTo: recipientEmail,
        usedDomain: emailResponse.data?.from || 'unknown'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("ERROR in test-email-template function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Wystąpił nieoczekiwany błąd',
        details: error.stack || 'Brak szczegółów błędu'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
