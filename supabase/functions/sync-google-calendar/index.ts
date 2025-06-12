
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { appointment_id } = await req.json();

    // Pobierz szczegóły wizyty
    const { data: appointment, error: appointmentError } = await supabase
      .from('patient_appointments')
      .select(`
        *,
        patients!inner(first_name, last_name, email),
        treatments!inner(name, description)
      `)
      .eq('id', appointment_id)
      .single();

    if (appointmentError) throw appointmentError;

    if (!appointment.calendar_sync_enabled) {
      return new Response(
        JSON.stringify({ message: "Calendar sync disabled for this appointment" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Pobierz aktywne integracje Google Calendar
    const { data: integrations, error: integrationsError } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('provider', 'google')
      .eq('is_active', true);

    if (integrationsError) throw integrationsError;

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active Google Calendar integrations found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results = [];

    for (const integration of integrations) {
      try {
        // Sprawdź czy token nie wygasł
        const tokenExpiry = new Date(integration.token_expires_at);
        const now = new Date();
        
        let accessToken = integration.access_token;

        if (tokenExpiry <= now && integration.refresh_token) {
          // Odśwież token
          const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: "your-google-client-id", // Konfigurowane w panelu
              client_secret: "your-google-client-secret",
              refresh_token: integration.refresh_token,
              grant_type: "refresh_token",
            }),
          });

          const refreshData = await refreshResponse.json();
          
          if (refreshData.access_token) {
            accessToken = refreshData.access_token;
            
            // Zaktualizuj token w bazie
            await supabase
              .from('calendar_integrations')
              .update({
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
              })
              .eq('id', integration.id);
          }
        }

        // Przygotuj wydarzenie kalendarza
        const startTime = new Date(appointment.scheduled_date);
        const endTime = new Date(startTime.getTime() + (appointment.duration_minutes || 60) * 60000);

        const event = {
          summary: `${appointment.treatments.name} - ${appointment.patients.first_name} ${appointment.patients.last_name}`,
          description: `Zabieg: ${appointment.treatments.name}\nPacjent: ${appointment.patients.first_name} ${appointment.patients.last_name}\n${appointment.pre_treatment_notes ? 'Notatki: ' + appointment.pre_treatment_notes : ''}`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Europe/Warsaw'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Warsaw'
          },
          attendees: [
            {
              email: appointment.patients.email,
              displayName: `${appointment.patients.first_name} ${appointment.patients.last_name}`
            }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 120 }
            ]
          }
        };

        // Sprawdź czy wydarzenie już istnieje
        const { data: existingEvent } = await supabase
          .from('appointment_calendar_events')
          .select('*')
          .eq('appointment_id', appointment_id)
          .eq('integration_id', integration.id)
          .single();

        let googleResponse;

        if (existingEvent) {
          // Aktualizuj istniejące wydarzenie
          googleResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEvent.external_event_id}`,
            {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(event),
            }
          );
        } else {
          // Utwórz nowe wydarzenie
          googleResponse = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(event),
            }
          );
        }

        const googleEvent = await googleResponse.json();

        if (googleResponse.ok) {
          // Zapisz lub zaktualizuj mapowanie
          await supabase
            .from('appointment_calendar_events')
            .upsert({
              appointment_id: appointment_id,
              integration_id: integration.id,
              external_event_id: googleEvent.id,
              event_url: googleEvent.htmlLink,
              sync_status: 'synced',
              last_synced_at: new Date().toISOString()
            });

          results.push({
            integration_id: integration.id,
            status: 'success',
            event_id: googleEvent.id,
            event_url: googleEvent.htmlLink
          });
        } else {
          throw new Error(`Google Calendar API error: ${googleEvent.error?.message || 'Unknown error'}`);
        }

      } catch (error) {
        console.error(`Error syncing with integration ${integration.id}:`, error);
        
        // Oznacz jako błąd
        await supabase
          .from('appointment_calendar_events')
          .upsert({
            appointment_id: appointment_id,
            integration_id: integration.id,
            sync_status: 'failed',
            last_synced_at: new Date().toISOString()
          });

        results.push({
          integration_id: integration.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sync completed`,
        results: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in sync-google-calendar function:", error);
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
