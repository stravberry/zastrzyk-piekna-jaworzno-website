-- Fix critical database function security issues
-- Add proper search_path to prevent injection attacks

-- Fix get_all_users_with_roles function
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, email_confirmed_at timestamp with time zone, roles text[])
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(
      ARRAY_AGG(ur.role::text) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY['user']
    ) as roles
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at
  ORDER BY u.created_at DESC
$function$;

-- Fix create_appointment_reminders function
CREATE OR REPLACE FUNCTION public.create_appointment_reminders(appointment_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  appointment_date TIMESTAMP WITH TIME ZONE;
  reminder_prefs JSONB;
BEGIN
  -- Get appointment date and reminder preferences
  SELECT scheduled_date, reminder_preferences 
  INTO appointment_date, reminder_prefs
  FROM public.patient_appointments 
  WHERE id = appointment_id_param;
  
  -- Remove existing reminders for this appointment
  DELETE FROM public.appointment_reminders WHERE appointment_id = appointment_id_param;
  
  -- Create 24h reminder
  IF (reminder_prefs->>'24h')::boolean = true THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '24h', appointment_date - INTERVAL '24 hours');
  END IF;
  
  -- Create 2h reminder
  IF (reminder_prefs->>'2h')::boolean = true THEN
    INSERT INTO public.appointment_reminders (appointment_id, reminder_type, scheduled_at)
    VALUES (appointment_id_param, '2h', appointment_date - INTERVAL '2 hours');
  END IF;
END;
$function$;

-- Fix get_code_settings function
CREATE OR REPLACE FUNCTION public.get_code_settings()
 RETURNS TABLE(head_code text, body_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT cs.head_code, cs.body_code
  FROM public.code_settings cs
  WHERE cs.id = 1;
END;
$function$;

-- Fix generate_ics_event function
CREATE OR REPLACE FUNCTION public.generate_ics_event(appointment_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  ics_content TEXT;
  appointment_record RECORD;
BEGIN
  SELECT 
    pa.scheduled_date,
    pa.duration_minutes,
    t.name as treatment_name,
    p.first_name || ' ' || p.last_name as patient_name,
    pa.pre_treatment_notes
  INTO appointment_record
  FROM public.patient_appointments pa
  JOIN public.treatments t ON pa.treatment_id = t.id
  JOIN public.patients p ON pa.patient_id = p.id
  WHERE pa.id = appointment_id_param;
  
  IF appointment_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  ics_content := 'BEGIN:VCALENDAR' || E'\r\n' ||
    'VERSION:2.0' || E'\r\n' ||
    'PRODID:-//Your Clinic//Medical Appointment//EN' || E'\r\n' ||
    'BEGIN:VEVENT' || E'\r\n' ||
    'UID:' || appointment_id_param || '@yourclinic.com' || E'\r\n' ||
    'DTSTART:' || to_char(appointment_record.scheduled_date AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"') || E'\r\n' ||
    'DTEND:' || to_char((appointment_record.scheduled_date + INTERVAL '1 minute' * COALESCE(appointment_record.duration_minutes, 60)) AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"') || E'\r\n' ||
    'SUMMARY:' || appointment_record.treatment_name || ' - ' || appointment_record.patient_name || E'\r\n' ||
    'DESCRIPTION:Zabieg: ' || appointment_record.treatment_name || 
    CASE WHEN appointment_record.pre_treatment_notes IS NOT NULL 
         THEN E'\r\nNotatki: ' || appointment_record.pre_treatment_notes 
         ELSE '' END || E'\r\n' ||
    'LOCATION:Twoja Klinika' || E'\r\n' ||
    'STATUS:CONFIRMED' || E'\r\n' ||
    'BEGIN:VALARM' || E'\r\n' ||
    'TRIGGER:-PT60M' || E'\r\n' ||
    'ACTION:DISPLAY' || E'\r\n' ||
    'DESCRIPTION:Przypomnienie o zabiegu za godzinę' || E'\r\n' ||
    'END:VALARM' || E'\r\n' ||
    'END:VEVENT' || E'\r\n' ||
    'END:VCALENDAR';
    
  RETURN ics_content;
END;
$function$;

-- Fix increment_blog_post_views function
CREATE OR REPLACE FUNCTION public.increment_blog_post_views(post_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert or update view count
  INSERT INTO public.blog_post_views (post_id, views, unique_views)
  VALUES (post_id, 1, 1)
  ON CONFLICT (post_id) 
  DO UPDATE SET 
    views = blog_post_views.views + 1,
    updated_at = now();
    
  -- Update the blog_posts table view_count for quick access
  UPDATE public.blog_posts 
  SET view_count = (
    SELECT views FROM public.blog_post_views WHERE blog_post_views.post_id = public.blog_posts.id
  )
  WHERE id = post_id;
END;
$function$;

-- Fix invite_user function
CREATE OR REPLACE FUNCTION public.invite_user(user_email text, user_role app_role DEFAULT 'user'::app_role)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check permissions
  IF NOT public.can_manage_users() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;
  
  -- In real app we would use Supabase Auth API
  -- For now return placeholder
  new_user_id := gen_random_uuid();
  
  -- Log activity
  PERFORM public.log_admin_activity(
    'invite_user',
    'user',
    new_user_id::text,
    jsonb_build_object('email', user_email, 'role', user_role)
  );
  
  RETURN new_user_id;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$function$;

-- Fix remove_user_role function
CREATE OR REPLACE FUNCTION public.remove_user_role(target_user_id uuid, target_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if user can manage roles
  IF NOT public.can_manage_users() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Don't allow removing last admin role
  IF target_role = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user';
    END IF;
  END IF;
  
  -- Remove role
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = target_role;
  
  -- Log activity
  PERFORM public.log_admin_activity(
    'remove_role',
    'user_role',
    target_user_id::text,
    jsonb_build_object('role', target_role)
  );
  
  RETURN TRUE;
END;
$function$;

-- Fix prevent_last_admin_removal function
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if we're trying to delete or update an admin role
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin') THEN
    
    -- Count remaining admin users (excluding the one being changed)
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin' AND user_id != OLD.user_id) < 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user from the system';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- Fix update_code_settings function
CREATE OR REPLACE FUNCTION public.update_code_settings(p_head_code text, p_body_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.code_settings (id, head_code, body_code, updated_at)
  VALUES (1, p_head_code, p_body_code, now())
  ON CONFLICT (id) 
  DO UPDATE SET 
    head_code = p_head_code,
    body_code = p_body_code,
    updated_at = now();
END;
$function$;

-- Fix trigger_create_appointment_reminders function
CREATE OR REPLACE FUNCTION public.trigger_create_appointment_reminders()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only for new appointments or when date changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.scheduled_date != NEW.scheduled_date) THEN
    PERFORM public.create_appointment_reminders(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(_identifier text, _action text, _max_attempts integer DEFAULT 5, _window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_attempts integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
  
  -- Get current attempts within window
  SELECT attempts, window_start INTO current_attempts, window_start_time
  FROM public.rate_limits
  WHERE identifier = _identifier 
    AND action = _action
    AND window_start > now() - interval '1 minute' * _window_minutes;
  
  -- If no record exists, create one
  IF current_attempts IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (_identifier, _action, 1);
    RETURN true;
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_attempts < _max_attempts THEN
    UPDATE public.rate_limits 
    SET attempts = attempts + 1, updated_at = now()
    WHERE identifier = _identifier AND action = _action;
    RETURN true;
  END IF;
  
  -- Rate limit exceeded
  UPDATE public.rate_limits 
  SET blocked_until = now() + interval '1 minute' * _window_minutes,
      updated_at = now()
  WHERE identifier = _identifier AND action = _action;
  
  RETURN false;
END;
$function$;

-- Fix create_code_settings_table_directly function
CREATE OR REPLACE FUNCTION public.create_code_settings_table_directly()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Create the table directly
  CREATE TABLE IF NOT EXISTS public.code_settings (
    id INT PRIMARY KEY,
    head_code TEXT,
    body_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Check if table is empty
  IF NOT EXISTS (SELECT 1 FROM public.code_settings LIMIT 1) THEN
    -- Insert default values
    INSERT INTO public.code_settings (id, head_code, body_code) VALUES (
      1,
      '<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({''gtm.start'':new Date().getTime(),event:''gtm.js''});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=''dataLayer''?''&l=''+l:'''';j.async=true;j.src=''https://www.googletagmanager.com/gtm.js?id=''+i+dl;f.parentNode.insertBefore(j,f);})(window,document,''script'',''dataLayer'',''GTM-XXXX'');</script><!-- End Google Tag Manager -->',
      '<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->'
    );
  END IF;
  
  -- Make sure RLS is enabled
  ALTER TABLE IF EXISTS public.code_settings ENABLE ROW LEVEL SECURITY;
  
  -- Create policies if they don't exist already
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'code_settings' 
    AND policyname = 'Allow authenticated select'
  ) THEN
    CREATE POLICY "Allow authenticated select" ON public.code_settings
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'code_settings' 
    AND policyname = 'Allow authenticated update'
  ) THEN
    CREATE POLICY "Allow authenticated update" ON public.code_settings
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'code_settings' 
    AND policyname = 'Allow authenticated insert'
  ) THEN
    CREATE POLICY "Allow authenticated insert" ON public.code_settings
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END;
$function$;

-- Fix get_pending_reminders function
CREATE OR REPLACE FUNCTION public.get_pending_reminders()
 RETURNS TABLE(id uuid, appointment_id uuid, reminder_type text, patient_name text, patient_email text, treatment_name text, scheduled_date timestamp with time zone, duration_minutes integer, pre_treatment_notes text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix search_patients function
CREATE OR REPLACE FUNCTION public.search_patients(search_term text)
 RETURNS TABLE(id uuid, first_name text, last_name text, phone text, email text, created_at timestamp with time zone, last_appointment timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.email,
    p.created_at,
    MAX(pa.scheduled_date) as last_appointment
  FROM public.patients p
  LEFT JOIN public.patient_appointments pa ON p.id = pa.patient_id
  WHERE 
    LOWER(p.first_name || ' ' || p.last_name) LIKE LOWER('%' || search_term || '%')
    OR LOWER(p.phone) LIKE LOWER('%' || search_term || '%')
    OR LOWER(p.email) LIKE LOWER('%' || search_term || '%')
  GROUP BY p.id, p.first_name, p.last_name, p.phone, p.email, p.created_at
  ORDER BY p.last_name, p.first_name;
$function$;