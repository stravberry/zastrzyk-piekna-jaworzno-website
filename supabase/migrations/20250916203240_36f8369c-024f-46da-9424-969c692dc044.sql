-- Add database indexes for better performance on appointment queries
CREATE INDEX IF NOT EXISTS idx_patient_appointments_scheduled_date 
ON public.patient_appointments (scheduled_date);

CREATE INDEX IF NOT EXISTS idx_patient_appointments_patient_id_scheduled_date 
ON public.patient_appointments (patient_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_patient_appointments_status_scheduled_date 
ON public.patient_appointments (status, scheduled_date);

-- Add index for patient search performance
CREATE INDEX IF NOT EXISTS idx_patients_name_search 
ON public.patients USING gin(to_tsvector('simple', first_name || ' ' || last_name));

CREATE INDEX IF NOT EXISTS idx_patients_phone_email 
ON public.patients (phone, email);

-- Add index for pricing categories lookup
CREATE INDEX IF NOT EXISTS idx_pricing_categories_id 
ON public.pricing_categories (id);

-- Add composite index for appointment reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status_scheduled 
ON public.appointment_reminders (status, scheduled_at) 
WHERE status = 'pending';