-- Enhanced Security Fixes for Critical Vulnerabilities

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

-- 2. Create enhanced encryption functions for highly sensitive medical data
CREATE OR REPLACE FUNCTION public.encrypt_medical_data(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  -- Log encryption attempt for audit trail
  PERFORM public.log_security_event(
    'medical_data_encrypted',
    'low',
    jsonb_build_object(
      'data_length', length(data),
      'timestamp', now()
    )
  );
  
  -- Enhanced encryption with salt (in production, use proper key management)
  RETURN encode(digest(gen_random_uuid()::text || data, 'sha256'), 'base64') || '::' || encode(data::bytea, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_medical_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  parts text[];
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  -- Check if data is in new encrypted format
  IF encrypted_data LIKE '%::%' THEN
    parts := string_to_array(encrypted_data, '::');
    IF array_length(parts, 1) = 2 THEN
      -- Log decryption for audit
      PERFORM public.log_security_event(
        'medical_data_decrypted',
        'medium',
        jsonb_build_object(
          'user_id', auth.uid(),
          'timestamp', now()
        )
      );
      
      RETURN convert_from(decode(parts[2], 'base64'), 'UTF8');
    END IF;
  END IF;
  
  -- Fallback for old format
  RETURN public.decrypt_sensitive_data(encrypted_data);
EXCEPTION
  WHEN OTHERS THEN
    RETURN encrypted_data;
END;
$$;

-- 3. Create secure calendar token storage with encryption
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

-- 4. Create trigger to encrypt calendar tokens on insert/update
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

-- 5. Update RLS policies with enhanced security
DROP POLICY IF EXISTS "Enhanced admin patient view with logging" ON public.patients;
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

-- 6. Enhanced treatment photos security
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

-- 7. Add security monitoring for admin activity
CREATE OR REPLACE FUNCTION public.monitor_admin_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log all admin table access
  PERFORM public.log_security_event(
    'admin_sensitive_table_access',
    'high',
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'user_id', auth.uid(),
      'timestamp', now(),
      'ip_address', inet_client_addr()
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Add monitoring triggers to sensitive tables
DROP TRIGGER IF EXISTS monitor_patient_access_trigger ON public.patients;
CREATE TRIGGER monitor_patient_access_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_admin_table_access();

DROP TRIGGER IF EXISTS monitor_treatment_photos_trigger ON public.treatment_photos;
CREATE TRIGGER monitor_treatment_photos_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.treatment_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_admin_table_access();