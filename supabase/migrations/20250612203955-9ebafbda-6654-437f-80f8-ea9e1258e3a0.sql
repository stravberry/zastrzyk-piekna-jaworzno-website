
-- Tabela do śledzenia przypomnień o wizytach
CREATE TABLE public.appointment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.patient_appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', '1h', 'custom')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela do przechowywania integracji z zewnętrznymi kalendarzami
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela do mapowania wizyt z wydarzeniami w zewnętrznych kalendarzach
CREATE TABLE public.appointment_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.patient_appointments(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.calendar_integrations(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  event_url TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed', 'deleted')),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(appointment_id, integration_id)
);

-- Tabela dla szablonów maili
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('reminder', 'confirmation', 'cancellation', 'reschedule')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dodanie nowych kolumn do tabeli wizyt
ALTER TABLE public.patient_appointments 
ADD COLUMN email_reminders_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN calendar_sync_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN reminder_preferences JSONB DEFAULT '{"24h": true, "2h": true}'::jsonb;

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_appointment_reminders_scheduled_at ON public.appointment_reminders(scheduled_at);
CREATE INDEX idx_appointment_reminders_status ON public.appointment_reminders(status);
CREATE INDEX idx_appointment_reminders_appointment_id ON public.appointment_reminders(appointment_id);
CREATE INDEX idx_calendar_integrations_provider ON public.calendar_integrations(provider);
CREATE INDEX idx_appointment_calendar_events_appointment_id ON public.appointment_calendar_events(appointment_id);

-- Włączenie RLS dla nowych tabel
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla appointment_reminders
CREATE POLICY "Allow authenticated users to view appointment reminders" ON public.appointment_reminders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert appointment reminders" ON public.appointment_reminders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update appointment reminders" ON public.appointment_reminders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Polityki RLS dla calendar_integrations
CREATE POLICY "Allow authenticated users to manage calendar integrations" ON public.calendar_integrations
  FOR ALL USING (auth.role() = 'authenticated');

-- Polityki RLS dla appointment_calendar_events
CREATE POLICY "Allow authenticated users to manage calendar events" ON public.appointment_calendar_events
  FOR ALL USING (auth.role() = 'authenticated');

-- Polityki RLS dla email_templates
CREATE POLICY "Allow authenticated users to manage email templates" ON public.email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Funkcja do automatycznego tworzenia przypomnień
CREATE OR REPLACE FUNCTION public.create_appointment_reminders(appointment_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_date TIMESTAMP WITH TIME ZONE;
  reminder_prefs JSONB;
BEGIN
  -- Pobierz datę wizyty i preferencje przypomnień
  SELECT scheduled_date, reminder_preferences 
  INTO appointment_date, reminder_prefs
  FROM public.patient_appointments 
  WHERE id = appointment_id_param;
  
  -- Usuń istniejące przypomnienia dla tej wizyty
  DELETE FROM public.appointment_reminders WHERE appointment_id = appointment_id_param;
  
  -- Utwórz przypomnienie 24h wcześniej
  IF (reminder_prefs->>'24h')::boolean = true THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '24h', appointment_date - INTERVAL '24 hours');
  END IF;
  
  -- Utwórz przypomnienie 2h wcześniej
  IF (reminder_prefs->>'2h')::boolean = true THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '2h', appointment_date - INTERVAL '2 hours');
  END IF;
END;
$$;

-- Trigger do automatycznego tworzenia przypomnień
CREATE OR REPLACE FUNCTION public.trigger_create_appointment_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tylko dla nowych wizyt lub gdy zmienia się data
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.scheduled_date != NEW.scheduled_date) THEN
    PERFORM public.create_appointment_reminders(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Przypisz trigger do tabeli wizyt
CREATE TRIGGER trigger_appointment_reminders
  AFTER INSERT OR UPDATE ON public.patient_appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_create_appointment_reminders();

-- Funkcja do pobierania przypomnień do wysłania
CREATE OR REPLACE FUNCTION public.get_pending_reminders()
RETURNS TABLE(
  id UUID,
  appointment_id UUID,
  reminder_type TEXT,
  patient_name TEXT,
  patient_email TEXT,
  treatment_name TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  pre_treatment_notes TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ar.id,
    ar.appointment_id,
    ar.reminder_type,
    p.first_name || ' ' || p.last_name as patient_name,
    p.email as patient_email,
    t.name as treatment_name,
    pa.scheduled_date,
    pa.duration_minutes,
    pa.pre_treatment_notes
  FROM public.appointment_reminders ar
  JOIN public.patient_appointments pa ON ar.appointment_id = pa.id
  JOIN public.patients p ON pa.patient_id = p.id
  JOIN public.treatments t ON pa.treatment_id = t.id
  WHERE ar.status = 'pending'
    AND ar.scheduled_at <= now()
    AND p.email IS NOT NULL
    AND pa.email_reminders_enabled = true
  ORDER BY ar.scheduled_at;
$$;

-- Wstaw domyślne szablony maili
INSERT INTO public.email_templates (name, subject, html_content, text_content, template_type) VALUES
('reminder_24h', 'Przypomnienie o wizycie - jutro o {{time}}', 
'<h2>Przypomnienie o wizycie</h2>
<p>Dzień dobry {{patient_name}},</p>
<p>Przypominamy o zaplanowanej wizycie:</p>
<ul>
<li><strong>Data:</strong> {{date}}</li>
<li><strong>Godzina:</strong> {{time}}</li>
<li><strong>Zabieg:</strong> {{treatment_name}}</li>
<li><strong>Czas trwania:</strong> {{duration}} minut</li>
</ul>
{{#if pre_treatment_notes}}
<p><strong>Ważne informacje:</strong><br>{{pre_treatment_notes}}</p>
{{/if}}
<p>W razie pytań lub konieczności zmiany terminu, prosimy o kontakt.</p>
<p>Pozdrawiamy,<br>Zespół Zastrzyk Piękna</p>',
'Przypomnienie o wizycie - {{patient_name}}\n\nData: {{date}}\nGodzina: {{time}}\nZabieg: {{treatment_name}}\nCzas trwania: {{duration}} minut\n\n{{#if pre_treatment_notes}}Ważne informacje: {{pre_treatment_notes}}\n\n{{/if}}W razie pytań prosimy o kontakt.\n\nPozdrawiamy,\nZespół Zastrzyk Piękna',
'reminder'),

('reminder_2h', 'Przypomnienie o wizycie - za 2 godziny', 
'<h2>Przypomnienie o wizycie</h2>
<p>Dzień dobry {{patient_name}},</p>
<p>Przypominamy o wizycie za 2 godziny:</p>
<ul>
<li><strong>Godzina:</strong> {{time}}</li>
<li><strong>Zabieg:</strong> {{treatment_name}}</li>
</ul>
{{#if pre_treatment_notes}}
<p><strong>Przygotowanie:</strong><br>{{pre_treatment_notes}}</p>
{{/if}}
<p>Do zobaczenia!</p>
<p>Zespół Zastrzyk Piękna</p>',
'Przypomnienie o wizycie za 2 godziny\n\n{{patient_name}}\nGodzina: {{time}}\nZabieg: {{treatment_name}}\n\n{{#if pre_treatment_notes}}Przygotowanie: {{pre_treatment_notes}}\n\n{{/if}}Do zobaczenia!\nZespół Zastrzyk Piękna',
'reminder');
