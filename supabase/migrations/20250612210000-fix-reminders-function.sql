
-- Poprawa funkcji get_pending_reminders
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
    AND LENGTH(TRIM(p.email)) > 0
    AND pa.email_reminders_enabled = true
    AND pa.status != 'cancelled'
  ORDER BY ar.scheduled_at;
$$;

-- Poprawa funkcji tworzenia przypomnień
CREATE OR REPLACE FUNCTION public.create_appointment_reminders(appointment_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_date TIMESTAMP WITH TIME ZONE;
  reminder_prefs JSONB;
  reminder_24h_time TIMESTAMP WITH TIME ZONE;
  reminder_2h_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Pobierz datę wizyty i preferencje przypomnień
  SELECT scheduled_date, reminder_preferences 
  INTO appointment_date, reminder_prefs
  FROM public.patient_appointments 
  WHERE id = appointment_id_param;
  
  IF appointment_date IS NULL THEN
    RAISE NOTICE 'Appointment not found: %', appointment_id_param;
    RETURN;
  END IF;
  
  -- Usuń istniejące przypomnienia dla tej wizyty
  DELETE FROM public.appointment_reminders WHERE appointment_id = appointment_id_param;
  
  -- Oblicz czasy przypomnień
  reminder_24h_time := appointment_date - INTERVAL '24 hours';
  reminder_2h_time := appointment_date - INTERVAL '2 hours';
  
  RAISE NOTICE 'Creating reminders for appointment % at %. 24h reminder at: %, 2h reminder at: %', 
    appointment_id_param, appointment_date, reminder_24h_time, reminder_2h_time;
  
  -- Utwórz przypomnienie 24h wcześniej (tylko jeśli jest w przyszłości)
  IF (reminder_prefs->>'24h')::boolean = true OR reminder_prefs IS NULL THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '24h', reminder_24h_time);
    RAISE NOTICE 'Created 24h reminder';
  END IF;
  
  -- Utwórz przypomnienie 2h wcześniej (tylko jeśli jest w przyszłości)
  IF (reminder_prefs->>'2h')::boolean = true OR reminder_prefs IS NULL THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '2h', reminder_2h_time);
    RAISE NOTICE 'Created 2h reminder';
  END IF;
END;
$$;

-- Dodaj funkcję do ręcznego tworzenia przypomnień dla istniejących wizyt
CREATE OR REPLACE FUNCTION public.create_missing_reminders()
RETURNS TABLE(
  appointment_id UUID,
  appointment_date TIMESTAMP WITH TIME ZONE,
  reminders_created INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record RECORD;
  created_count INTEGER;
BEGIN
  FOR appointment_record IN 
    SELECT id, scheduled_date 
    FROM public.patient_appointments 
    WHERE scheduled_date > now() 
    AND status != 'cancelled'
    AND email_reminders_enabled = true
  LOOP
    -- Sprawdź czy ma już przypomnienia
    IF NOT EXISTS(SELECT 1 FROM public.appointment_reminders WHERE appointment_id = appointment_record.id) THEN
      PERFORM public.create_appointment_reminders(appointment_record.id);
      created_count := 2; -- 24h i 2h
    ELSE
      created_count := 0;
    END IF;
    
    RETURN QUERY SELECT appointment_record.id, appointment_record.scheduled_date, created_count;
  END LOOP;
END;
$$;
