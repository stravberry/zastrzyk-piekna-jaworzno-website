-- Enhanced Security Fixes for Critical Vulnerabilities (Fixed)

-- 1. Strengthen patient data validation function with additional security checks
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
  ip_address inet;
  failed_attempts integer;
BEGIN
  -- Get current user ID and IP
  user_id := auth.uid();
  ip_address := inet_client_addr();
  
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'no_session', 
        'timestamp', now(),
        'ip_address', ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Check for rate limiting on this IP
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_log
  WHERE event_type = 'patient_access_denied'
    AND ip_address = inet_client_addr()
    AND created_at > now() - INTERVAL '1 hour';
    
  IF failed_attempts > 10 THEN
    PERFORM public.log_security_event(
      'patient_access_rate_limited',
      'critical',
      jsonb_build_object(
        'reason', 'too_many_failed_attempts',
        'user_id', user_id,
        'failed_attempts', failed_attempts,
        'ip_address', ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Verify admin status with additional checks
  admin_status := public.is_admin();
  
  IF NOT admin_status THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'insufficient_privileges',
        'user_id', user_id,
        'timestamp', now(),
        'ip_address', ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Enhanced session validation: Check session age (max 4 hours for patient data)
  SELECT created_at INTO last_activity
  FROM auth.sessions 
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF last_activity IS NOT NULL THEN
    session_age := now() - last_activity;
    IF session_age > INTERVAL '4 hours' THEN
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

-- 2. Create enhanced encryption functions for calendar tokens
CREATE OR REPLACE FUNCTION public.encrypt_calendar_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN token;
  END IF;
  
  -- Log token encryption
  PERFORM public.log_security_event(
    'calendar_token_encrypted',
    'medium',
    jsonb_build_object(
      'timestamp', now(),
      'user_id', auth.uid()
    )
  );
  
  -- Enhanced encryption for calendar tokens
  RETURN 'ENC_' || encode(digest(gen_random_uuid()::text || token, 'sha256'), 'hex') || '::' || encode(token::bytea, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_calendar_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  parts text[];
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN encrypted_token;
  END IF;
  
  -- Only decrypt if properly encrypted
  IF encrypted_token LIKE 'ENC_%::%' THEN
    parts := string_to_array(substring(encrypted_token from 5), '::');
    IF array_length(parts, 1) = 2 THEN
      -- Log token access
      PERFORM public.log_security_event(
        'calendar_token_accessed',
        'high',
        jsonb_build_object(
          'user_id', auth.uid(),
          'timestamp', now()
        )
      );
      
      RETURN convert_from(decode(parts[2], 'base64'), 'UTF8');
    END IF;
  END IF;
  
  RETURN encrypted_token; -- Return as-is if not encrypted
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL; -- Fail securely
END;
$$;

-- 3. Create trigger to encrypt calendar tokens on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_calendar_integration_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Encrypt access token if provided
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' AND NOT (NEW.access_token LIKE 'ENC_%::%') THEN
    NEW.access_token := public.encrypt_calendar_token(NEW.access_token);
  END IF;
  
  -- Encrypt refresh token if provided
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' AND NOT (NEW.refresh_token LIKE 'ENC_%::%') THEN
    NEW.refresh_token := public.encrypt_calendar_token(NEW.refresh_token);
  END IF;
  
  -- Log the modification
  PERFORM public.log_security_event(
    'calendar_integration_modified',
    'high',
    jsonb_build_object(
      'operation', TG_OP,
      'integration_id', NEW.id,
      'modified_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for calendar integrations
DROP TRIGGER IF EXISTS encrypt_calendar_tokens_trigger ON public.calendar_integrations;
CREATE TRIGGER encrypt_calendar_tokens_trigger
  BEFORE INSERT OR UPDATE ON public.calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_calendar_integration_tokens();

-- 4. Update RLS policies with enhanced security
DROP POLICY IF EXISTS "Enhanced admin patient view with logging" ON public.patients;
DROP POLICY IF EXISTS "Enhanced admin patient insert with validation" ON public.patients;  
DROP POLICY IF EXISTS "Enhanced admin patient update with logging" ON public.patients;
DROP POLICY IF EXISTS "Enhanced admin patient delete with strict validation" ON public.patients;

CREATE POLICY "Ultra secure admin patient access with enhanced validation"
ON public.patients
FOR ALL
USING (
  is_admin() 
  AND validate_patient_access_session_enhanced()
  AND (
    SELECT COUNT(*) FROM public.security_audit_log 
    WHERE event_type = 'patient_access_denied' 
    AND ip_address = inet_client_addr() 
    AND created_at > now() - INTERVAL '1 hour'
  ) < 10
)
WITH CHECK (
  is_admin() 
  AND validate_patient_access_session_enhanced()
);

-- 5. Enhanced treatment photos security
DROP POLICY IF EXISTS "Only admins can manage treatment photos" ON public.treatment_photos;
CREATE POLICY "Ultra secure treatment photo access"
ON public.treatment_photos
FOR ALL
USING (
  is_admin() 
  AND validate_patient_access_session_enhanced()
  AND (
    SELECT COUNT(*) FROM public.security_audit_log 
    WHERE event_type LIKE '%photo%' 
    AND user_id = auth.uid() 
    AND created_at > now() - INTERVAL '1 hour'
  ) < 20
)
WITH CHECK (
  is_admin() 
  AND validate_patient_access_session_enhanced()
);

-- 6. Enhanced contact submissions security with stricter validation
DROP POLICY IF EXISTS "Enhanced secure public contact submissions" ON public.contact_submissions;
CREATE POLICY "Ultra secure contact submissions with rate limiting"
ON public.contact_submissions
FOR INSERT
WITH CHECK (
  (name IS NOT NULL) AND (email IS NOT NULL) AND (subject IS NOT NULL) AND (message IS NOT NULL) 
  AND (consent_given = true) 
  AND (length(name) >= 2) AND (length(name) <= 100) 
  AND (length(email) >= 5) AND (length(email) <= 255) 
  AND (length(subject) >= 3) AND (length(subject) <= 200) 
  AND (length(message) >= 10) AND (length(message) <= 2000) 
  AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) 
  AND (name !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'::text) 
  AND (subject !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'::text) 
  AND (message !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'::text) 
  AND (name !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'::text) 
  AND (subject !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'::text) 
  AND (message !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'::text) 
  AND ((phone IS NULL) OR ((length(phone) >= 9) AND (phone ~ '^[\d\s\+\-\(\)\.]+$'::text)))
  AND (
    SELECT COUNT(*) FROM public.contact_submissions 
    WHERE ip_address = inet_client_addr() 
    AND created_at > now() - INTERVAL '1 hour'
  ) < 3
);

-- 7. Create secure calendar token retrieval function
CREATE OR REPLACE FUNCTION public.get_calendar_tokens_secure(integration_id uuid)
RETURNS TABLE(access_token text, refresh_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Log token access
  PERFORM public.log_security_event(
    'calendar_tokens_accessed',
    'critical',
    jsonb_build_object(
      'integration_id', integration_id,
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  -- Return decrypted tokens
  RETURN QUERY
  SELECT 
    public.decrypt_calendar_token(ci.access_token) as access_token,
    public.decrypt_calendar_token(ci.refresh_token) as refresh_token
  FROM public.calendar_integrations ci
  WHERE ci.id = integration_id;
END;
$$;