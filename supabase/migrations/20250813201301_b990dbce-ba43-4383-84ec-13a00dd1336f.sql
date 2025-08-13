-- CRITICAL SECURITY FIX: Restrict patient medical records access to admin users only
-- This fixes the vulnerability where any authenticated user could access all patient data

-- Drop the overly permissive existing policies
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON public.patients;

-- Create secure admin-only policies for patient medical records
CREATE POLICY "Only admins can view patient records"
ON public.patients
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only admins can insert patient records"
ON public.patients
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update patient records"
ON public.patients
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete patient records"
ON public.patients
FOR DELETE
USING (public.is_admin());

-- Log this critical security fix
INSERT INTO public.security_audit_log (
  event_type,
  severity,
  details
) VALUES (
  'patient_data_security_fix',
  'critical',
  jsonb_build_object(
    'action', 'restricted_patient_access_to_admins_only',
    'previous_policy', 'any_authenticated_user_could_access_all_patients',
    'new_policy', 'admin_only_access',
    'reason', 'CRITICAL: Patient medical records were accessible to any authenticated user'
  )
);