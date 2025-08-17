-- CRITICAL SECURITY FIX: Calendar Integration Token Protection
-- Drop existing permissive policies that allow any authenticated user to access OAuth tokens
DROP POLICY IF EXISTS "Allow authenticated users to manage calendar integrations" ON public.calendar_integrations;

-- Create admin-only access policies for calendar integrations
CREATE POLICY "Only admins can view calendar integrations" 
ON public.calendar_integrations 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can insert calendar integrations" 
ON public.calendar_integrations 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update calendar integrations" 
ON public.calendar_integrations 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Only admins can delete calendar integrations" 
ON public.calendar_integrations 
FOR DELETE 
USING (public.is_admin());

-- MODERATE SECURITY FIX: Email Templates Protection
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to manage email templates" ON public.email_templates;

-- Create admin-only policies for email templates
CREATE POLICY "Only admins can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- MODERATE SECURITY FIX: Treatments Protection
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage treatments" ON public.treatments;
DROP POLICY IF EXISTS "Authenticated users can view treatments" ON public.treatments;

-- Create admin-only policies for treatments
CREATE POLICY "Only admins can view treatments" 
ON public.treatments 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can manage treatments" 
ON public.treatments 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- MODERATE SECURITY FIX: Calendar Events Protection
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can view calendar events" ON public.calendar_events;

-- Create admin-only policies for calendar events
CREATE POLICY "Only admins can view calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can manage calendar events" 
ON public.calendar_events 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- MODERATE SECURITY FIX: Appointment Calendar Events Protection
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to manage calendar events" ON public.appointment_calendar_events;

-- Create admin-only policies for appointment calendar events
CREATE POLICY "Only admins can view appointment calendar events" 
ON public.appointment_calendar_events 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can manage appointment calendar events" 
ON public.appointment_calendar_events 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add security logging for sensitive access attempts
CREATE OR REPLACE FUNCTION public.log_sensitive_access_attempt(_table_name text, _action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log the access attempt
  PERFORM public.log_security_event(
    'sensitive_data_access_attempt',
    'medium',
    jsonb_build_object(
      'table_name', _table_name,
      'action', _action,
      'user_id', auth.uid(),
      'is_admin', public.is_admin()
    )
  );
END;
$$;