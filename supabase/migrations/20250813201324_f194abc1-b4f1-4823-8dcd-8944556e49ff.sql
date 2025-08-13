-- ADDITIONAL SECURITY FIX: Secure patient-related tables
-- Fix overly permissive policies on appointments, treatment photos, and reminders

-- Fix patient_appointments table (contains patient medical appointment data)
DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.patient_appointments;
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.patient_appointments;

CREATE POLICY "Only admins can manage patient appointments"
ON public.patient_appointments
FOR ALL
USING (public.is_admin());

-- Fix treatment_photos table (contains patient treatment photos)
DROP POLICY IF EXISTS "Authenticated users can manage photos" ON public.treatment_photos;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON public.treatment_photos;

CREATE POLICY "Only admins can manage treatment photos"
ON public.treatment_photos
FOR ALL
USING (public.is_admin());

-- Fix appointment_reminders table (contains patient appointment reminder data)
DROP POLICY IF EXISTS "Allow authenticated users to insert appointment reminders" ON public.appointment_reminders;
DROP POLICY IF EXISTS "Allow authenticated users to update appointment reminders" ON public.appointment_reminders;
DROP POLICY IF EXISTS "Allow authenticated users to view appointment reminders" ON public.appointment_reminders;

CREATE POLICY "Only admins can manage appointment reminders"
ON public.appointment_reminders
FOR ALL
USING (public.is_admin());

-- Log the additional security fixes
INSERT INTO public.security_audit_log (
  event_type,
  severity,
  details
) VALUES (
  'patient_related_data_security_fix',
  'critical',
  jsonb_build_object(
    'action', 'restricted_patient_related_data_to_admins_only',
    'tables_fixed', ARRAY['patient_appointments', 'treatment_photos', 'appointment_reminders'],
    'previous_policy', 'any_authenticated_user_could_access_patient_data',
    'new_policy', 'admin_only_access',
    'reason', 'CRITICAL: Patient appointment and medical data was accessible to any authenticated user'
  )
);