-- Fix search_patients function - remove ambiguous ip_address reference
CREATE OR REPLACE FUNCTION public.search_patients(search_term text)
RETURNS TABLE(
  id uuid, 
  first_name text, 
  last_name text, 
  phone text, 
  email text, 
  created_at timestamp with time zone, 
  last_appointment timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.email,
    p.created_at,
    MAX(pa.scheduled_date) as last_appointment
  FROM public.patients p
  LEFT JOIN public.patient_appointments pa ON p.id = pa.patient_id
  WHERE 
    LOWER(p.first_name || ' ' || p.last_name) LIKE LOWER('%' || search_term || '%')
    OR LOWER(p.phone) LIKE LOWER('%' || search_term || '%')
    OR LOWER(p.email) LIKE LOWER('%' || search_term || '%')
  GROUP BY p.id, p.first_name, p.last_name, p.phone, p.email, p.created_at
  ORDER BY p.last_name, p.first_name;
$$;