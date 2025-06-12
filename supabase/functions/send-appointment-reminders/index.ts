
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderData {
  id: string;
  appointment_id: string;
  reminder_type: string;
  patient_name: string;
  patient_email: string;
  treatment_name: string;
  scheduled_date: string;
  duration_minutes: number;
  pre_treatment_notes: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching pending reminders...");

    // Pobierz przypomnienia do wysłania
    const { data: reminders, error: remindersError } = await supabase
      .rpc('get_pending_reminders');

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Pobierz szablon maila
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'reminder')
      .eq('is_active', true);

    if (templateError) {
      console.error("Error fetching templates:", templateError);
      throw templateError;
    }

    const sentCount = [];

    for (const reminder of reminders as ReminderData[]) {
      try {
        console.log(`Processing reminder ${reminder.id} for ${reminder.patient_email}`);

        // Znajdź odpowiedni szablon
        const template = templates?.find(t => t.name === `reminder_${reminder.reminder_type}`);
        if (!template) {
          console.error(`Template not found for reminder type: ${reminder.reminder_type}`);
          continue;
        }

        // Przygotuj dane do szablonu
        const appointmentDate = new Date(reminder.scheduled_date);
        const templateData = {
          patient_name: reminder.patient_name,
          treatment_name: reminder.treatment_name,
          date: appointmentDate.toLocaleDateString('pl-PL'),
          time: appointmentDate.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          duration: reminder.duration_minutes,
          pre_treatment_notes: reminder.pre_treatment_notes
        };

        // Zastąp zmienne w szablonie
        let htmlContent = template.html_content;
        let textContent = template.text_content || '';
        let subject = template.subject;

        Object.entries(templateData).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value || '');
          textContent = textContent.replace(new RegExp(placeholder, 'g'), value || '');
          subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
        });

        // Obsługa warunków {{#if}}
        htmlContent = htmlContent.replace(
          /\{\{#if pre_treatment_notes\}\}(.*?)\{\{\/if\}\}/gs,
          reminder.pre_treatment_notes ? '$1' : ''
        );
        textContent = textContent.replace(
          /\{\{#if pre_treatment_notes\}\}(.*?)\{\{\/if\}\}/gs,
          reminder.pre_treatment_notes ? '$1' : ''
        );

        // Wyślij email
        const emailResponse = await resend.emails.send({
          from: "Zastrzyk Piękna <przypomnienia@zastrzykpiekna.pl>",
          to: [reminder.patient_email],
          subject: subject,
          html: htmlContent,
          text: textContent,
        });

        console.log("Email sent:", emailResponse);

        // Oznacz przypomnienie jako wysłane
        await supabase
          .from('appointment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_sent: true
          })
          .eq('id', reminder.id);

        sentCount.push(reminder.id);

      } catch (error) {
        console.error(`Error sending reminder ${reminder.id}:`, error);
        
        // Oznacz jako błąd
        await supabase
          .from('appointment_reminders')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', reminder.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${sentCount.length} reminders`,
        sent_reminders: sentCount
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
