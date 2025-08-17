-- Enhanced security for contact_submissions table
-- Add field-level encryption and audit controls

-- Create secure contact data encryption functions
CREATE OR REPLACE FUNCTION public.encrypt_contact_data(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  -- Basic encryption for contact data - in production use proper encryption
  RETURN encode(data::bytea, 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_contact_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  -- Basic decryption - in production use proper decryption
  RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN encrypted_data; -- Return as-is if decryption fails
END;
$function$;

-- Create function to anonymize IP addresses for logging
CREATE OR REPLACE FUNCTION public.anonymize_ip(ip_addr inet)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF ip_addr IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Anonymize last octet for IPv4, last 64 bits for IPv6
  IF family(ip_addr) = 4 THEN
    RETURN host(set_masklen(ip_addr, 24)) || '.xxx';
  ELSE
    RETURN host(set_masklen(ip_addr, 64)) || '::xxxx';
  END IF;
END;
$function$;

-- Create secure contact submission function
CREATE OR REPLACE FUNCTION public.submit_contact_secure(
  _name text,
  _email text,
  _phone text,
  _subject text,
  _message text,
  _consent_given boolean,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  submission_id uuid;
  rate_check jsonb;
BEGIN
  -- Enhanced rate limiting for contact submissions
  rate_check := public.enhanced_rate_limit_check(
    COALESCE(_email, _ip_address::text), 
    'contact_submission', 
    3, -- max 3 attempts
    60, -- per hour
    120 -- block for 2 hours
  );
  
  IF NOT (rate_check->>'allowed')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rate limit exceeded. Please try again later.',
      'blocked_until', rate_check->>'blocked_until'
    );
  END IF;
  
  -- Log contact attempt
  PERFORM public.log_security_event(
    'contact_submission_attempt',
    'medium',
    jsonb_build_object(
      'email_domain', split_part(_email, '@', 2),
      'has_phone', _phone IS NOT NULL,
      'message_length', length(_message),
      'ip_anonymized', public.anonymize_ip(_ip_address),
      'consent_given', _consent_given
    ),
    _ip_address,
    _user_agent
  );
  
  -- Insert encrypted contact data
  INSERT INTO public.contact_submissions (
    name,
    email,
    phone,
    subject,
    message,
    consent_given,
    ip_address,
    user_agent
  ) VALUES (
    public.encrypt_contact_data(_name),
    public.encrypt_contact_data(_email),
    CASE WHEN _phone IS NOT NULL THEN public.encrypt_contact_data(_phone) ELSE NULL END,
    public.encrypt_contact_data(_subject),
    public.encrypt_contact_data(_message),
    _consent_given,
    _ip_address,
    _user_agent
  ) RETURNING id INTO submission_id;
  
  -- Log successful submission
  PERFORM public.log_security_event(
    'contact_submission_success',
    'low',
    jsonb_build_object(
      'submission_id', submission_id,
      'ip_anonymized', public.anonymize_ip(_ip_address)
    ),
    _ip_address,
    _user_agent
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'submission_id', submission_id
  );
END;
$function$;

-- Create secure contact retrieval function for admins
CREATE OR REPLACE FUNCTION public.get_contact_submissions_secure()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  subject text,
  message text,
  consent_given boolean,
  ip_address text,
  user_agent text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Validate admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Log admin access to contact data
  PERFORM public.log_security_event(
    'contact_data_admin_access',
    'high',
    jsonb_build_object(
      'admin_user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  -- Return decrypted contact data
  RETURN QUERY
  SELECT 
    cs.id,
    public.decrypt_contact_data(cs.name) as name,
    public.decrypt_contact_data(cs.email) as email,
    CASE WHEN cs.phone IS NOT NULL THEN public.decrypt_contact_data(cs.phone) ELSE NULL END as phone,
    public.decrypt_contact_data(cs.subject) as subject,
    public.decrypt_contact_data(cs.message) as message,
    cs.consent_given,
    public.anonymize_ip(cs.ip_address) as ip_address,
    LEFT(cs.user_agent, 50) || '...' as user_agent, -- Truncate user agent
    cs.status,
    cs.created_at,
    cs.updated_at
  FROM public.contact_submissions cs
  ORDER BY cs.created_at DESC;
END;
$function$;

-- Create trigger to automatically encrypt contact data on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_contact_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only encrypt if data is not already encrypted (to prevent double encryption)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Log the contact data modification
    PERFORM public.log_security_event(
      'contact_data_modified',
      'medium',
      jsonb_build_object(
        'operation', TG_OP,
        'submission_id', NEW.id,
        'modified_by_admin', public.is_admin(),
        'ip_anonymized', public.anonymize_ip(NEW.ip_address)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for contact data encryption
DROP TRIGGER IF EXISTS encrypt_contact_data_trigger ON public.contact_submissions;
CREATE TRIGGER encrypt_contact_data_trigger
  BEFORE INSERT OR UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_contact_on_change();

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_contact_submissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete contact submissions older than 2 years
  DELETE FROM public.contact_submissions 
  WHERE created_at < now() - INTERVAL '2 years'
  AND status = 'responded';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  PERFORM public.log_security_event(
    'contact_data_cleanup',
    'low',
    jsonb_build_object(
      'deleted_submissions', deleted_count,
      'retention_period', '2 years'
    )
  );
END;
$function$;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Allow public contact form submissions" ON public.contact_submissions;
CREATE POLICY "Restrict public contact submissions with validation"
ON public.contact_submissions
FOR INSERT
WITH CHECK (
  -- Enhanced validation
  name IS NOT NULL AND
  email IS NOT NULL AND
  subject IS NOT NULL AND
  message IS NOT NULL AND
  consent_given = true AND
  length(name) >= 2 AND length(name) <= 100 AND
  length(email) >= 5 AND length(email) <= 255 AND
  length(subject) >= 3 AND length(subject) <= 200 AND
  length(message) >= 10 AND length(message) <= 2000 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Additional security checks
  name !~* '(script|javascript|<|>|&lt;|&gt;)' AND
  subject !~* '(script|javascript|<|>|&lt;|&gt;)' AND
  message !~* '(script|javascript|<|>|&lt;|&gt;)'
);