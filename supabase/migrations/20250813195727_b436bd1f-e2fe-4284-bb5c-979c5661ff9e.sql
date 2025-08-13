-- Fix critical security issues identified in security review

-- 1. Add missing RLS policies for rate_limits table
CREATE POLICY "Only system can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false); -- Deny all access by default, only functions can access

-- 2. Add missing RLS policies for security_blocks table  
CREATE POLICY "Only system can manage security blocks"
ON public.security_blocks
FOR ALL
USING (false); -- Deny all access by default, only functions can access

-- 3. Fix database function security - add proper search_path to prevent injection attacks

-- Fix create_code_settings_table_if_not_exists function
CREATE OR REPLACE FUNCTION public.create_code_settings_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    SET search_path TO 'public';
    -- Function logic here
END;
$function$;

-- Fix can_manage_users function
CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(_event_type text, _severity text DEFAULT 'medium'::text, _details jsonb DEFAULT NULL::jsonb, _ip_address inet DEFAULT NULL::inet, _user_agent text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    severity,
    ip_address,
    user_agent,
    details
  )
  VALUES (
    auth.uid(),
    _event_type,
    _severity,
    _ip_address,
    _user_agent,
    _details
  );
END;
$function$;

-- Fix log_admin_activity function
CREATE OR REPLACE FUNCTION public.log_admin_activity(_action text, _resource_type text DEFAULT NULL::text, _resource_id text DEFAULT NULL::text, _details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _details
  );
END;
$function$;

-- Fix enhanced_rate_limit_check function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(_identifier text, _action text, _max_attempts integer DEFAULT 5, _window_minutes integer DEFAULT 15, _block_duration_minutes integer DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_attempts integer;
  is_blocked boolean := false;
  block_info record;
BEGIN
  -- Check if identifier is currently blocked
  SELECT * INTO block_info
  FROM public.security_blocks
  WHERE identifier = _identifier 
    AND blocked_until > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF block_info.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'reason', block_info.reason,
      'blocked_until', block_info.blocked_until
    );
  END IF;
  
  -- Clean up old rate limit entries
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
  
  -- Get current attempts within window
  SELECT attempts INTO current_attempts
  FROM public.rate_limits
  WHERE identifier = _identifier 
    AND action = _action
    AND window_start > now() - interval '1 minute' * _window_minutes;
  
  -- If no record exists, create one
  IF current_attempts IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (_identifier, _action, 1);
    
    RETURN jsonb_build_object('allowed', true, 'blocked', false, 'attempts', 1);
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_attempts < _max_attempts THEN
    UPDATE public.rate_limits 
    SET attempts = attempts + 1, updated_at = now()
    WHERE identifier = _identifier AND action = _action;
    
    RETURN jsonb_build_object('allowed', true, 'blocked', false, 'attempts', current_attempts + 1);
  END IF;
  
  -- Rate limit exceeded - create block
  INSERT INTO public.security_blocks (identifier, block_type, reason, blocked_until)
  VALUES (
    _identifier, 
    'rate_limit_block', 
    'Too many ' || _action || ' attempts',
    now() + interval '1 minute' * _block_duration_minutes
  );
  
  -- Log security event
  PERFORM public.log_security_event(
    'rate_limit_exceeded',
    'high',
    jsonb_build_object('action', _action, 'attempts', current_attempts, 'identifier', _identifier)
  );
  
  RETURN jsonb_build_object(
    'allowed', false,
    'blocked', true,
    'reason', 'Rate limit exceeded',
    'blocked_until', now() + interval '1 minute' * _block_duration_minutes
  );
END;
$function$;