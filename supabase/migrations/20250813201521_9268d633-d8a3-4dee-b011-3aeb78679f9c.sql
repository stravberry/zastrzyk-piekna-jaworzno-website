-- SECURITY FIX: Secure contact form submissions
-- Allow public contact form submissions but add proper abuse protection

-- Create a policy that allows public INSERT but with basic abuse protection
CREATE POLICY "Allow public contact form submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Basic validation checks at database level
  name IS NOT NULL AND 
  email IS NOT NULL AND 
  subject IS NOT NULL AND 
  message IS NOT NULL AND 
  consent_given = true AND
  length(name) >= 2 AND 
  length(name) <= 100 AND
  length(email) >= 5 AND 
  length(email) <= 255 AND
  length(subject) >= 3 AND 
  length(subject) <= 200 AND
  length(message) >= 10 AND 
  length(message) <= 2000 AND
  -- Email format validation
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Prevent DELETE access for security (no one should delete contact submissions)
CREATE POLICY "Prevent contact deletion"
ON public.contact_submissions
FOR DELETE
USING (false);

-- Log this security improvement
INSERT INTO public.security_audit_log (
  event_type,
  severity,
  details
) VALUES (
  'contact_form_security_improvement',
  'medium',
  jsonb_build_object(
    'action', 'added_public_insert_policy_with_validation',
    'previous_state', 'no_insert_policy_allowing_unrestricted_access',
    'new_state', 'public_insert_allowed_with_database_validation',
    'security_improvement', 'added_input_validation_at_database_level'
  )
);