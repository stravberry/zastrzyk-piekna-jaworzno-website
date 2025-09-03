-- Enhanced Security Fix for Contact Submissions (Final)
-- This addresses the security concern by adding multiple layers of protection

-- 1. Drop existing permissive policies and create more restrictive ones
DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Only admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Restrict public contact submissions with validation" ON public.contact_submissions;

-- 2. Create enhanced admin validation function for contact access
CREATE OR REPLACE FUNCTION public.validate_admin_contact_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_id uuid;
  is_admin_user boolean := false;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    PERFORM public.log_security_event(
      'contact_access_denied',
      'critical',
      jsonb_build_object('reason', 'no_authentication', 'timestamp', now())
    );
    RETURN false;
  END IF;
  
  -- Check admin status with additional validation
  is_admin_user := public.is_admin();
  
  IF NOT is_admin_user THEN
    PERFORM public.log_security_event(
      'contact_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'insufficient_privileges',
        'user_id', user_id,
        'timestamp', now(),
        'attempted_table', 'contact_submissions'
      )
    );
    RETURN false;
  END IF;
  
  -- Log successful validation
  PERFORM public.log_security_event(
    'contact_access_granted',
    'medium',
    jsonb_build_object(
      'user_id', user_id,
      'timestamp', now(),
      'access_type', 'admin_validated'
    )
  );
  
  RETURN true;
END;
$$;

-- 3. Create restrictive RLS policies with enhanced validation
CREATE POLICY "Enhanced admin-only contact view with logging"
ON public.contact_submissions
FOR SELECT
USING (
  -- Triple validation: authenticated, admin role, and function validation
  auth.role() = 'authenticated' 
  AND public.is_admin() 
  AND public.validate_admin_contact_access()
);

CREATE POLICY "Enhanced admin-only contact update with logging"
ON public.contact_submissions
FOR UPDATE
USING (
  auth.role() = 'authenticated' 
  AND public.is_admin() 
  AND public.validate_admin_contact_access()
);

-- 4. Enhanced public submission policy with stricter validation
CREATE POLICY "Enhanced secure public contact submissions"
ON public.contact_submissions
FOR INSERT
WITH CHECK (
  -- All existing validations plus additional security checks
  name IS NOT NULL 
  AND email IS NOT NULL 
  AND subject IS NOT NULL 
  AND message IS NOT NULL 
  AND consent_given = true
  -- Length validations
  AND length(name) >= 2 AND length(name) <= 100
  AND length(email) >= 5 AND length(email) <= 255  
  AND length(subject) >= 3 AND length(subject) <= 200
  AND length(message) >= 10 AND length(message) <= 2000
  -- Enhanced email validation
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- XSS and script injection prevention
  AND name !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'
  AND subject !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'
  AND message !~* '(script|javascript|<|>|&lt;|&gt;|eval|expression|onload|onerror)'
  -- Additional malicious content prevention
  AND name !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'
  AND subject !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'
  AND message !~* '(document\.|window\.|alert\(|confirm\(|prompt\()'
  -- Phone validation if provided
  AND (phone IS NULL OR (length(phone) >= 9 AND phone ~ '^[\d\s\+\-\(\)\.]+$'))
);

-- 5. Create enhanced contact data modification logging trigger
CREATE OR REPLACE FUNCTION public.log_contact_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'contact_submission_created',
      'medium',
      jsonb_build_object(
        'operation', 'INSERT',
        'submission_id', NEW.id,
        'has_phone', NEW.phone IS NOT NULL,
        'timestamp', now()
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'contact_data_modified',
      'high',
      jsonb_build_object(
        'operation', 'UPDATE',
        'submission_id', NEW.id,
        'modified_by', auth.uid(),
        'timestamp', now()
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 6. Create the trigger for contact data changes
DROP TRIGGER IF EXISTS contact_data_audit_trigger ON public.contact_submissions;
CREATE TRIGGER contact_data_audit_trigger
  AFTER INSERT OR UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.log_contact_data_changes();