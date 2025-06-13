
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManualReminderRequest {
  appointmentId: string;
  reminderType: '24h' | '2h' | 'confirmation';
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Manual reminder function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointmentId, reminderType }: ManualReminderRequest = await req.json();
    console.log('Manual reminder request:', { appointmentId, reminderType });

    // Get appointment details with patient and treatment info
    const { data: appointment, error: appointmentError } = await supabase
      .from('patient_appointments')
      .select(`
        *,
        patients (*),
        treatments (*)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError);
      throw new Error('Nie znaleziono wizyty');
    }

    if (!appointment.patients.email) {
      throw new Error('Pacjent nie ma podanego adresu email');
    }

    // Determine template name based on reminder type
    let templateName: string;
    switch (reminderType) {
      case '24h':
        templateName = 'reminder_24h';
        break;
      case '2h':
        templateName = 'reminder_2h';
        break;
      case 'confirmation':
        templateName = 'appointment_confirmation';
        break;
      default:
        throw new Error('Nieprawidłowy typ przypomnienia');
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error('Nie znaleziono aktywnego szablonu email');
    }

    // Prepare template data
    const templateData = {
      patient_name: `${appointment.patients.first_name} ${appointment.patients.last_name}`,
      date: new Date(appointment.scheduled_date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date(appointment.scheduled_date).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      treatment_name: appointment.treatments.name,
      duration: appointment.duration_minutes?.toString() || '60',
      pre_treatment_notes: appointment.pre_treatment_notes || ''
    };

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

    const processedSubject = processTemplate(template.subject, templateData);
    const processedHtmlContent = processTemplate(template.html_content, templateData);
    const processedTextContent = processTemplate(template.text_content || '', templateData);

    // Send email using verified domain
    const emailResponse = await resend.emails.send({
      from: "Zastrzyk Piękna <noreply@zastrzykpiekna.eu>",
      to: [appointment.patients.email],
      reply_to: "zastrzykpiekna.kontakt@gmail.com",
      subject: processedSubject,
      html: processedHtmlContent,
      text: processedTextContent || undefined,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(`Błąd wysyłania: ${emailResponse.error.message}`);
    }

    console.log('Manual reminder sent successfully:', emailResponse.data?.id);
    console.log('Sent to:', appointment.patients.email);

    // Log the manual reminder
    await supabase
      .from('appointment_reminders')
      .insert({
        appointment_id: appointmentId,
        reminder_type: reminderType,
        scheduled_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        email_sent: true
      });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
        message: 'Przypomnienie zostało wysłane pomyślnie',
        sentTo: appointment.patients.email
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-manual-reminder function:", error);
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
