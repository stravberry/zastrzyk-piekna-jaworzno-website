
-- Phase 1: Critical Database Security Fixes

-- 1. Add missing RLS policies for tables that need them
-- Ensure gallery_images has proper admin-only policies
DROP POLICY IF EXISTS "Allow public read access to gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin full access to gallery images" ON public.gallery_images;

CREATE POLICY "Allow public read access to gallery images" 
ON public.gallery_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin full access to gallery images" 
ON public.gallery_images 
FOR ALL 
USING (public.is_admin());

-- Ensure gallery_categories has proper admin-only policies
DROP POLICY IF EXISTS "Allow public read access to gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin full access to gallery categories" ON public.gallery_categories;

CREATE POLICY "Allow public read access to gallery categories" 
ON public.gallery_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin full access to gallery categories" 
ON public.gallery_categories 
FOR ALL 
USING (public.is_admin());

-- Ensure pricing_categories has proper admin-only policies
DROP POLICY IF EXISTS "Allow public read access to pricing categories" ON public.pricing_categories;
DROP POLICY IF EXISTS "Allow admin full access to pricing categories" ON public.pricing_categories;

CREATE POLICY "Allow public read access to pricing categories" 
ON public.pricing_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to pricing categories" 
ON public.pricing_categories 
FOR ALL 
USING (public.is_admin());

-- Ensure blog_posts has proper policies
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin full access to blog posts" ON public.blog_posts;

CREATE POLICY "Allow public read access to published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_admin());

-- 2. Strengthen user role management to prevent last admin removal
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger to prevent last admin removal
DROP TRIGGER IF EXISTS prevent_last_admin_removal_trigger ON public.user_roles;
CREATE TRIGGER prevent_last_admin_removal_trigger
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_removal();

-- 3. Add security audit table for enhanced monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.is_admin());

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _severity text DEFAULT 'medium',
  _details jsonb DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 4. Enhanced rate limiting with IP blocking
CREATE TABLE IF NOT EXISTS public.security_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  block_type text NOT NULL, -- 'ip_block', 'user_block', etc.
  reason text NOT NULL,
  blocked_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security blocks
ALTER TABLE public.security_blocks ENABLE ROW LEVEL SECURITY;

-- Enhanced rate limiting function with blocking capability
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  _identifier text,
  _action text,
  _max_attempts integer DEFAULT 5,
  _window_minutes integer DEFAULT 15,
  _block_duration_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 5. Add comprehensive input validation constraints
-- Ensure contact submissions have proper validation
ALTER TABLE public.contact_submissions 
DROP CONSTRAINT IF EXISTS valid_contact_name_length;

ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_contact_name_length CHECK (
  length(trim(name)) >= 2 AND length(trim(name)) <= 100
);

ALTER TABLE public.contact_submissions 
DROP CONSTRAINT IF EXISTS valid_contact_subject_length;

ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_contact_subject_length CHECK (
  length(trim(subject)) >= 3 AND length(trim(subject)) <= 200
);

ALTER TABLE public.contact_submissions 
DROP CONSTRAINT IF EXISTS valid_contact_message_length;

ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_contact_message_length CHECK (
  length(trim(message)) >= 10 AND length(trim(message)) <= 2000
);
