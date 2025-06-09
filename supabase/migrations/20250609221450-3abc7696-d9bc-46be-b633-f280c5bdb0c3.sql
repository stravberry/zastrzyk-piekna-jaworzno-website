
-- Phase 1: Critical RLS Policy Cleanup (Fixed version)
-- First, let's clean up conflicting policies on blog_posts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.blog_posts;

-- Clean up conflicting policies on gallery tables
DROP POLICY IF EXISTS "Allow authenticated select" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.gallery_categories;

-- Clean up conflicting policies on pricing tables
DROP POLICY IF EXISTS "Allow authenticated select" ON public.pricing_categories;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.pricing_categories;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.pricing_categories;

-- Drop existing code_settings policies first, then recreate
DROP POLICY IF EXISTS "Allow authenticated select" ON public.code_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.code_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.code_settings;
DROP POLICY IF EXISTS "Allow admins to select code settings" ON public.code_settings;
DROP POLICY IF EXISTS "Allow admins to update code settings" ON public.code_settings;
DROP POLICY IF EXISTS "Allow admins to insert code settings" ON public.code_settings;

-- Update code_settings policies to use admin role check
CREATE POLICY "Allow admins to select code settings" 
ON public.code_settings 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Allow admins to update code settings" 
ON public.code_settings 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Allow admins to insert code settings" 
ON public.code_settings 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Add missing RLS policies for admin_activity_log
DROP POLICY IF EXISTS "Only admins can view activity log" ON public.admin_activity_log;
DROP POLICY IF EXISTS "Only admins can insert activity log" ON public.admin_activity_log;

CREATE POLICY "Only admins can view activity log" 
ON public.admin_activity_log 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can insert activity log" 
ON public.admin_activity_log 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Strengthen user_roles table protection
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin());

-- Create contact_submissions table for secure contact form handling (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  ip_address inet,
  user_agent text,
  consent_given boolean NOT NULL DEFAULT false,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view contact submissions
DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Only admins can update contact submissions" ON public.contact_submissions;

CREATE POLICY "Only admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can update contact submissions" 
ON public.contact_submissions 
FOR UPDATE 
USING (public.is_admin());

-- Add validation constraints for contact submissions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'valid_contact_email' 
                 AND table_name = 'contact_submissions') THEN
    ALTER TABLE public.contact_submissions 
    ADD CONSTRAINT valid_contact_email CHECK (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'valid_contact_phone' 
                 AND table_name = 'contact_submissions') THEN
    ALTER TABLE public.contact_submissions 
    ADD CONSTRAINT valid_contact_phone CHECK (
      phone IS NULL OR length(trim(phone)) >= 9
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'non_empty_contact_name' 
                 AND table_name = 'contact_submissions') THEN
    ALTER TABLE public.contact_submissions 
    ADD CONSTRAINT non_empty_contact_name CHECK (length(trim(name)) > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'non_empty_contact_message' 
                 AND table_name = 'contact_submissions') THEN
    ALTER TABLE public.contact_submissions 
    ADD CONSTRAINT non_empty_contact_message CHECK (length(trim(message)) > 0);
  END IF;
END $$;

-- Create rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  action text NOT NULL, -- contact_form, login_attempt, etc.
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for performance (only create if they don't exist)
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS on rate_limits (only system can access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _action text,
  _max_attempts integer DEFAULT 5,
  _window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
