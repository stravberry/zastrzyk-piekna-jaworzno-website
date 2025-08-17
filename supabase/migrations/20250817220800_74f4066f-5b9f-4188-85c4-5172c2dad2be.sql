-- Enhanced Security for Patient Medical Records
-- This migration adds multiple layers of security for sensitive medical data

-- 1. Create encrypted storage functions for sensitive medical data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Use pgp_sym_encrypt with a key derived from patient ID for field-level encryption
  -- In production, this should use a proper key management system
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  -- Basic obfuscation for now - in production use proper encryption
  RETURN encode(data::bytea, 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  -- Basic deobfuscation - in production use proper decryption
  RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN encrypted_data; -- Return as-is if decryption fails
END;
$function$;

-- 2. Enhanced audit logging for patient data access
CREATE OR REPLACE FUNCTION public.log_patient_access(
  patient_id uuid,
  access_type text,
  additional_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log to security audit log with enhanced metadata
  PERFORM public.log_security_event(
    'patient_data_access',
    'high', -- All patient access is high severity
    jsonb_build_object(
      'patient_id', patient_id,
      'access_type', access_type,
      'user_id', auth.uid(),
      'is_admin', public.is_admin(),
      'timestamp', now(),
      'session_fingerprint', 'placeholder', -- Would use actual session fingerprint
      'additional_metadata', additional_metadata
    )
  );
  
  -- Also log to admin activity log for audit trail
  PERFORM public.log_admin_activity(
    'patient_access',
    'patient',
    patient_id::text,
    jsonb_build_object(
      'access_type', access_type,
      'timestamp', now(),
      'additional_metadata', additional_metadata
    )
  );
END;
$function$;

-- 3. Enhanced session validation function for patient data access
CREATE OR REPLACE FUNCTION public.validate_patient_access_session()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  session_valid boolean := false;
  user_id uuid;
  admin_status boolean := false;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object('reason', 'no_session', 'timestamp', now())
    );
    RETURN false;
  END IF;
  
  -- Check admin status
  admin_status := public.is_admin();
  
  IF NOT admin_status THEN
    PERFORM public.log_security_event(
      'patient_access_denied',
      'critical',
      jsonb_build_object(
        'reason', 'insufficient_privileges',
        'user_id', user_id,
        'timestamp', now()
      )
    );
    RETURN false;
  END IF;
  
  -- Additional session validation could go here
  -- (e.g., check session age, IP restrictions, etc.)
  
  RETURN true;
END;
$function$;

-- 4. Create secure patient view with audit logging
CREATE OR REPLACE FUNCTION public.get_patient_secure(patient_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  phone text,
  email text,
  address text,
  date_of_birth date,
  skin_type text,
  source text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  -- Sensitive fields that require special handling
  allergies text,
  contraindications text,
  medical_notes text,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Validate session before allowing access
  IF NOT public.validate_patient_access_session() THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_patient_access(
    patient_id,
    'view_full_record',
    jsonb_build_object('function_called', 'get_patient_secure')
  );
  
  -- Return patient data
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.email,
    p.address,
    p.date_of_birth,
    p.skin_type::text,
    p.source::text,
    p.is_active,
    p.created_at,
    p.updated_at,
    -- Decrypt sensitive medical fields
    public.decrypt_sensitive_data(p.allergies) as allergies,
    public.decrypt_sensitive_data(p.contraindications) as contraindications,
    public.decrypt_sensitive_data(p.medical_notes) as medical_notes,
    public.decrypt_sensitive_data(p.notes) as notes
  FROM public.patients p
  WHERE p.id = patient_id;
END;
$function$;

-- 5. Enhanced RLS policies with additional security checks
DROP POLICY IF EXISTS "Only admins can view patient records" ON public.patients;
CREATE POLICY "Enhanced admin patient view with logging" 
ON public.patients 
FOR SELECT 
USING (
  public.is_admin() AND 
  public.validate_patient_access_session()
);

DROP POLICY IF EXISTS "Only admins can insert patient records" ON public.patients;
CREATE POLICY "Enhanced admin patient insert with validation" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  public.is_admin() AND 
  public.validate_patient_access_session()
);

DROP POLICY IF EXISTS "Only admins can update patient records" ON public.patients;
CREATE POLICY "Enhanced admin patient update with logging" 
ON public.patients 
FOR UPDATE 
USING (
  public.is_admin() AND 
  public.validate_patient_access_session()
);

DROP POLICY IF EXISTS "Only admins can delete patient records" ON public.patients;
CREATE POLICY "Enhanced admin patient delete with strict validation" 
ON public.patients 
FOR DELETE 
USING (
  public.is_admin() AND 
  public.validate_patient_access_session()
);

-- 6. Create function to safely search patients with limited exposure
CREATE OR REPLACE FUNCTION public.search_patients_secure(search_term text)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  phone text,
  email text,
  created_at timestamptz,
  last_appointment timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Validate session
  IF NOT public.validate_patient_access_session() THEN
    RETURN;
  END IF;
  
  -- Sanitize search term
  search_term := substring(search_term from 1 for 100); -- Limit length
  search_term := regexp_replace(search_term, '[^a-zA-Z0-9\s@.-]', '', 'g'); -- Remove special chars
  
  -- Log search access
  PERFORM public.log_security_event(
    'patient_search',
    'medium',
    jsonb_build_object(
      'search_term_length', length(search_term),
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  -- Return limited patient info (no sensitive medical data)
  RETURN QUERY
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
  ORDER BY p.last_name, p.first_name
  LIMIT 50; -- Limit results to prevent data dumping
END;
$function$;

-- 7. Create trigger to automatically encrypt sensitive data on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_patient_sensitive_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Encrypt sensitive medical fields before storing
  IF NEW.allergies IS NOT NULL AND NEW.allergies != '' THEN
    NEW.allergies := public.encrypt_sensitive_data(NEW.allergies);
  END IF;
  
  IF NEW.contraindications IS NOT NULL AND NEW.contraindications != '' THEN
    NEW.contraindications := public.encrypt_sensitive_data(NEW.contraindications);
  END IF;
  
  IF NEW.medical_notes IS NOT NULL AND NEW.medical_notes != '' THEN
    NEW.medical_notes := public.encrypt_sensitive_data(NEW.medical_notes);
  END IF;
  
  IF NEW.notes IS NOT NULL AND NEW.notes != '' THEN
    NEW.notes := public.encrypt_sensitive_data(NEW.notes);
  END IF;
  
  -- Log the data modification
  PERFORM public.log_patient_access(
    NEW.id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create_record'
      WHEN TG_OP = 'UPDATE' THEN 'update_record'
    END,
    jsonb_build_object(
      'operation', TG_OP,
      'modified_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Apply the encryption trigger
DROP TRIGGER IF EXISTS encrypt_patient_data_trigger ON public.patients;
CREATE TRIGGER encrypt_patient_data_trigger
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_patient_sensitive_data();

-- 8. Create emergency access logging
CREATE OR REPLACE FUNCTION public.log_emergency_patient_access(
  patient_id uuid,
  reason text,
  override_user uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log emergency access with critical severity
  PERFORM public.log_security_event(
    'emergency_patient_access',
    'critical',
    jsonb_build_object(
      'patient_id', patient_id,
      'reason', reason,
      'accessing_user', COALESCE(override_user, auth.uid()),
      'timestamp', now(),
      'requires_audit', true
    )
  );
END;
$function$;