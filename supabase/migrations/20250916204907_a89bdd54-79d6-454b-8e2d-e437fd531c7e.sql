-- Fix ambiguous ip_address reference in patient security functions
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
  client_ip_address inet;
  failed_attempts integer;
BEGIN
  -- Get current user ID and IP
  user_id := auth.uid();
  client_ip_address := inet_client_addr();
  
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'no_session', 
        'timestamp', now(),
        'ip_address', client_ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Check for rate limiting on this IP using table alias
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_log sal
  WHERE sal.event_type = 'patient_access_denied'
    AND sal.ip_address = client_ip_address
    AND sal.created_at > now() - INTERVAL '1 hour';
    
  IF failed_attempts > 10 THEN
    PERFORM public.log_security_event(
      'patient_access_rate_limited',
      'critical',
      jsonb_build_object(
        'reason', 'too_many_failed_attempts',
        'user_id', user_id,
        'failed_attempts', failed_attempts,
        'ip_address', client_ip_address
      )
    );
    RETURN false;
  END IF;
  
  -- Verify admin status
  admin_status := public.is_admin();
  
  IF NOT admin_status THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'insufficient_privileges',
        'user_id', user_id,
        'timestamp', now(),
        'ip_address', client_ip_address
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;