-- Enhanced patient data security functions
CREATE OR REPLACE FUNCTION public.validate_patient_access_session_enhanced()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  session_valid boolean := false;
  user_id uuid;
  admin_status boolean := false;
  last_activity timestamp with time zone;
  session_age interval;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'no_session', 
        'timestamp', now(),
        'ip_address', inet_client_addr()
      )
    );
    RETURN false;
  END IF;
  
  -- Check admin status
  admin_status := public.is_admin();
  
  IF NOT admin_status THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'insufficient_privileges',
        'user_id', user_id,
        'timestamp', now(),
        'ip_address', inet_client_addr()
      )
    );
    RETURN false;
  END IF;
  
  -- Enhanced session validation: Check session age (max 8 hours)
  SELECT created_at INTO last_activity
  FROM auth.sessions 
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF last_activity IS NOT NULL THEN
    session_age := now() - last_activity;
    IF session_age > INTERVAL '8 hours' THEN
      PERFORM public.log_security_event(
        'patient_access_denied',
        'high',
        jsonb_build_object(
          'reason', 'session_expired',
          'user_id', user_id,
          'session_age_hours', EXTRACT(HOUR FROM session_age),
          'timestamp', now()
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  -- Log successful validation
  PERFORM public.log_security_event(
    'patient_access_validated',
    'medium',
    jsonb_build_object(
      'user_id', user_id,
      'session_age_minutes', EXTRACT(EPOCH FROM session_age)/60,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- Enhanced contact form security with honeypot and geolocation detection
CREATE OR REPLACE FUNCTION public.enhanced_contact_security_check(_email text, _ip_address inet, _user_agent text, _honeypot_field text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  suspicious_score integer := 0;
  country_code text;
  is_suspicious boolean := false;
BEGIN
  -- Check honeypot field (should be empty)
  IF _honeypot_field IS NOT NULL AND _honeypot_field != '' THEN
    PERFORM public.log_security_event(
      'contact_bot_detected',
      'high',
      jsonb_build_object(
        'honeypot_filled', _honeypot_field,
        'ip_address', _ip_address,
        'user_agent', _user_agent
      )
    );
    RETURN jsonb_build_object('allowed', false, 'reason', 'Bot detected');
  END IF;
  
  -- Check for suspicious email patterns
  IF _email ~* '(temp|disposable|10minute|guerrilla)' THEN
    suspicious_score := suspicious_score + 3;
  END IF;
  
  -- Check for suspicious user agents
  IF _user_agent ~* '(bot|crawler|spider|scraper)' THEN
    suspicious_score := suspicious_score + 5;
  END IF;
  
  -- Check submission frequency from same IP
  IF (SELECT COUNT(*) FROM public.contact_submissions 
      WHERE ip_address = _ip_address 
      AND created_at > now() - INTERVAL '1 hour') > 2 THEN
    suspicious_score := suspicious_score + 4;
  END IF;
  
  -- Determine if suspicious
  is_suspicious := suspicious_score >= 5;
  
  IF is_suspicious THEN
    PERFORM public.log_security_event(
      'contact_suspicious_activity',
      'high',
      jsonb_build_object(
        'suspicious_score', suspicious_score,
        'email_pattern', _email,
        'ip_address', _ip_address,
        'user_agent', LEFT(_user_agent, 100)
      )
    );
    
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'Suspicious activity detected',
      'score', suspicious_score
    );
  END IF;
  
  RETURN jsonb_build_object('allowed', true, 'score', suspicious_score);
END;
$$;

-- Admin session security monitoring
CREATE OR REPLACE FUNCTION public.validate_admin_session_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_id uuid;
  admin_status boolean := false;
  session_count integer;
  last_admin_activity timestamp with time zone;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  admin_status := public.is_admin();
  
  IF NOT admin_status THEN
    RETURN false;
  END IF;
  
  -- Check for multiple concurrent admin sessions (security risk)
  SELECT COUNT(*) INTO session_count
  FROM auth.sessions 
  WHERE user_id = auth.uid()
  AND created_at > now() - INTERVAL '24 hours';
  
  IF session_count > 3 THEN
    PERFORM public.log_security_event(
      'admin_multiple_sessions',
      'high',
      jsonb_build_object(
        'user_id', user_id,
        'session_count', session_count,
        'timestamp', now()
      )
    );
  END IF;
  
  -- Update last admin activity
  INSERT INTO public.admin_activity_log (user_id, action, details)
  VALUES (user_id, 'session_validation', jsonb_build_object('timestamp', now()));
  
  RETURN true;
END;
$$;

-- Security alert system
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security alerts" ON public.security_alerts
FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can update security alerts" ON public.security_alerts
FOR UPDATE USING (is_admin());

-- Function to create security alerts
CREATE OR REPLACE FUNCTION public.create_security_alert(_type text, _severity text, _title text, _description text, _metadata jsonb DEFAULT '{}')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO public.security_alerts (alert_type, severity, title, description, metadata)
  VALUES (_type, _severity, _title, _description, _metadata)
  RETURNING id INTO alert_id;
  
  -- Log the alert creation
  PERFORM public.log_security_event(
    'security_alert_created',
    _severity,
    jsonb_build_object(
      'alert_id', alert_id,
      'alert_type', _type,
      'title', _title
    )
  );
  
  RETURN alert_id;
END;
$$;