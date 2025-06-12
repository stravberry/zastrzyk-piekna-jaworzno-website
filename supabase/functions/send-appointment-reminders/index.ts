

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

interface EmailTemplate {
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
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

    console.log("Starting reminder sending process...");

    // Pobierz przypomnienia do wysłania - używamy funkcji get_pending_reminders
    const { data: reminders, error: remindersError } = await supabase.rpc('get_pending_reminders');

    console.log(`get_pending_reminders query result:`, { reminders, error: remindersError });

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      console.log("No pending reminders found");
      
      // Sprawdź wszystkie wizyty i przypomnienia w systemie dla debugowania
      const { data: allAppointments } = await supabase
        .from('patient_appointments')
        .select(`
          id,
          scheduled_date,
          email_reminders_enabled,
          status,
          patients(first_name, last_name, email),
          treatments(name)
        `)
        .order('scheduled_date');

      const { data: allReminders } = await supabase
        .from('appointment_reminders')
        .select('*')
        .order('scheduled_at');

      console.log(`Debug info - Total appointments: ${allAppointments?.length || 0}`);
      console.log(`Debug info - Total reminders: ${allReminders?.length || 0}`);
      
      // Pokaż szczegóły pierwszych kilku wizyt
      if (allAppointments) {
        allAppointments.slice(0, 3).forEach(apt => {
          console.log(`Appointment ${apt.id}: ${apt.scheduled_date}, reminders_enabled: ${apt.email_reminders_enabled}, status: ${apt.status}, patient: ${apt.patients?.email}`);
        });
      }

      return new Response(
        JSON.stringify({ 
          message: "No pending reminders",
          sent_reminders: [],
          debug_info: {
            total_appointments: allAppointments?.length || 0,
            total_reminders: allReminders?.length || 0,
            current_time: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${reminders.length} pending reminders to process`);

    // Pobierz szablony maili
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'reminder')
      .eq('is_active', true);

    if (templateError) {
      console.error("Error fetching templates:", templateError);
      throw templateError;
    }

    console.log(`Found ${templates?.length || 0} email templates`);

    const sentCount = [];
    const failedCount = [];

    for (const reminder of reminders as ReminderData[]) {
      try {
        console.log(`Processing reminder ${reminder.id} for ${reminder.patient_email}`);

        if (!reminder.patient_email) {
          console.log(`Skipping reminder ${reminder.id} - no email address`);
          continue;
        }

        // Znajdź odpowiedni szablon
        const template = templates?.find(t => t.name === `reminder_${reminder.reminder_type}`) as EmailTemplate;
        
        let htmlContent: string;
        let textContent: string;
        let subject: string;

        if (!template) {
          console.log(`Template not found for reminder type: ${reminder.reminder_type}, using fallback`);
          
          // Fallback template
          subject = `Przypomnienie o wizycie - ${reminder.patient_name}`;
          htmlContent = `
            <h2>Przypomnienie o wizycie</h2>
            <p>Dzień dobry ${reminder.patient_name},</p>
            <p>Przypominamy o zaplanowanej wizycie:</p>
            <ul>
              <li><strong>Zabieg:</strong> ${reminder.treatment_name}</li>
              <li><strong>Data:</strong> ${new Date(reminder.scheduled_date).toLocaleDateString('pl-PL')}</li>
              <li><strong>Godzina:</strong> ${new Date(reminder.scheduled_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Czas trwania:</strong> ${reminder.duration_minutes || 60} minut</li>
            </ul>
            ${reminder.pre_treatment_notes ? `<p><strong>Uwagi:</strong> ${reminder.pre_treatment_notes}</p>` : ''}
            <p>Pozdrawiamy,<br>Zastrzyk Piękna</p>
          `;
          textContent = `
            Przypomnienie o wizycie - ${reminder.patient_name}
            
            Zabieg: ${reminder.treatment_name}
            Data: ${new Date(reminder.scheduled_date).toLocaleDateString('pl-PL')}
            Godzina: ${new Date(reminder.scheduled_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            Czas trwania: ${reminder.duration_minutes || 60} minut
            
            ${reminder.pre_treatment_notes ? `Uwagi: ${reminder.pre_treatment_notes}` : ''}
            
            Pozdrawiamy,
            Zastrzyk Piękna
          `;
        } else {
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
            duration: reminder.duration_minutes || 60,
            pre_treatment_notes: reminder.pre_treatment_notes || ''
          };

          // Zastąp zmienne w szablonie
          htmlContent = template.html_content;
          textContent = template.text_content || '';
          subject = template.subject;

          Object.entries(templateData).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
            textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
            subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
          });

          // Obsługa warunków {{#if}}
          const ifRegex = /\{\{#if pre_treatment_notes\}\}(.*?)\{\{\/if\}\}/gs;
          const replacement = reminder.pre_treatment_notes ? '$1' : '';
          htmlContent = htmlContent.replace(ifRegex, replacement);
          textContent = textContent.replace(ifRegex, replacement);
        }

        console.log(`Sending email to ${reminder.patient_email} with subject: ${subject}`);

        // Wyślij email - używamy zweryfikowanej domeny onboarding@resend.dev
        const emailResponse = await resend.emails.send({
          from: "Zastrzyk Piękna <onboarding@resend.dev>",
          to: [reminder.patient_email],
          subject: subject,
          html: htmlContent,
          text: textContent,
        });

        console.log("Email sent successfully:", emailResponse);

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message);
        }

        // Oznacz przypomnienie jako wysłane
        const { error: updateError } = await supabase
          .from('appointment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_sent: true
          })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Error updating reminder ${reminder.id}:`, updateError);
        }

        sentCount.push(reminder.id);

      } catch (error) {
        console.error(`Error sending reminder ${reminder.id}:`, error);
        failedCount.push(reminder.id);
        
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

    console.log(`Sent ${sentCount.length} reminders successfully, ${failedCount.length} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${sentCount.length} reminders`,
        sent_reminders: sentCount,
        failed_reminders: failedCount,
        total_processed: reminders.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

