
-- First, let's clean up existing invalid phone data before applying constraints

-- Update invalid phone numbers (less than 9 characters when trimmed) to NULL
UPDATE public.patients 
SET phone = NULL 
WHERE phone IS NOT NULL AND length(trim(phone)) < 9;

-- Update invalid email addresses to NULL
UPDATE public.patients 
SET email = NULL 
WHERE email IS NOT NULL AND NOT (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Now apply the constraints after data cleanup
ALTER TABLE public.patients 
ADD CONSTRAINT valid_email CHECK (
  email IS NULL OR 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

ALTER TABLE public.patients 
ADD CONSTRAINT valid_phone CHECK (
  phone IS NULL OR 
  length(trim(phone)) >= 9
);

ALTER TABLE public.patients 
ADD CONSTRAINT non_empty_first_name CHECK (length(trim(first_name)) > 0);

ALTER TABLE public.patients 
ADD CONSTRAINT non_empty_last_name CHECK (length(trim(last_name)) > 0);
