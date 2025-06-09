
-- Create enum for appointment status
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- Create enum for patient source
CREATE TYPE patient_source AS ENUM ('instagram', 'facebook', 'google', 'recommendation', 'website', 'other');

-- Create enum for skin type
CREATE TYPE skin_type AS ENUM ('normal', 'dry', 'oily', 'combination', 'sensitive');

-- Create enum for photo type
CREATE TYPE photo_type AS ENUM ('before', 'after', 'control_1week', 'control_1month');

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  address TEXT,
  skin_type skin_type,
  allergies TEXT,
  contraindications TEXT,
  medical_notes TEXT,
  source patient_source DEFAULT 'other',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create treatments table (based on existing pricing data)
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price DECIMAL(10,2),
  contraindications TEXT,
  aftercare_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create patient appointments table
CREATE TABLE public.patient_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES public.treatments(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  status appointment_status DEFAULT 'scheduled',
  pre_treatment_notes TEXT,
  products_used TEXT,
  post_treatment_notes TEXT,
  cost DECIMAL(10,2),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create treatment photos table
CREATE TABLE public.treatment_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.patient_appointments(id) ON DELETE CASCADE,
  photo_type photo_type NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.patient_appointments(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  reminder_minutes INTEGER DEFAULT 60,
  ics_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Authenticated users can view patients" ON public.patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON public.patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON public.patients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete patients" ON public.patients
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for treatments
CREATE POLICY "Authenticated users can view treatments" ON public.treatments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage treatments" ON public.treatments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view appointments" ON public.patient_appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage appointments" ON public.patient_appointments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for photos
CREATE POLICY "Authenticated users can view photos" ON public.treatment_photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage photos" ON public.treatment_photos
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for calendar events
CREATE POLICY "Authenticated users can view calendar events" ON public.calendar_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage calendar events" ON public.calendar_events
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_appointments_patient ON public.patient_appointments(patient_id);
CREATE INDEX idx_appointments_date ON public.patient_appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON public.patient_appointments(status);
CREATE INDEX idx_photos_appointment ON public.treatment_photos(appointment_id);

-- Insert initial treatments from pricing data
INSERT INTO public.treatments (name, category, description, duration_minutes, price) VALUES
-- Terapie przeciwstarzeniowe
('Biostymulacja skóry', 'Terapie przeciwstarzeniowe', 'Profesjonalna biostymulacja z zastosowaniem najnowszych technologii', 60, 400.00),
('Terapia tkankowa', 'Terapie przeciwstarzeniowe', 'Innowacyjna terapia stymulująca regenerację tkanek', 90, 600.00),
('Mezoterapia igłowa', 'Terapie przeciwstarzeniowe', 'Mezoterapia z zastosowaniem specjalistycznych preparatów', 45, 350.00),

-- Modelowanie ust
('Powiększanie ust kwasem hialuronowym', 'Modelowanie ust', 'Profesjonalne modelowanie ust z użyciem certyfikowanych fillerów', 30, 800.00),
('Korekta asymetrii ust', 'Modelowanie ust', 'Precyzyjna korekta kształtu i symetrii ust', 45, 900.00),
('Konturowanie ust', 'Modelowanie ust', 'Podkreślenie naturalnego konturu ust', 30, 700.00),

-- Autologia
('Fibryna bogatopłytkowa (PRF)', 'Autologia', 'Terapia z wykorzystaniem własnej fibryny pacjenta', 60, 500.00),
('PRP (Osocze bogatopłytkowe)', 'Autologia', 'Terapia regeneracyjna z użyciem własnego osocza', 45, 450.00),
('Kombinacja PRP + Mezoterapia', 'Autologia', 'Kompleksowa terapia łącząca PRP z mezoterapią', 90, 700.00),

-- Makijaż permanentny
('Brwi metodą pudrową', 'Makijaż permanentny', 'Naturalne brwi z efektem pudru', 120, 600.00),
('Kreski górne', 'Makijaż permanentny', 'Precyzyjne kreski na górnych powiekach', 90, 500.00),
('Usta', 'Makijaż permanentny', 'Naturalny kontur i wypełnienie ust', 150, 800.00),

-- Peelingi
('Peeling chemiczny TCA', 'Peelingi', 'Głęboki peeling chemiczny', 60, 300.00),
('Peeling glikolowy', 'Peelingi', 'Delikatny peeling kwasami owocowymi', 45, 200.00),
('Peeling salicylowy', 'Peelingi', 'Peeling dedykowany cerze tłustej i problematycznej', 45, 250.00);

-- Create function to search patients
CREATE OR REPLACE FUNCTION search_patients(search_term TEXT)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_appointment TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY DEFINER
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

-- Create function to generate ICS calendar events
CREATE OR REPLACE FUNCTION generate_ics_event(
  appointment_id_param UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ics_content TEXT;
  appointment_record RECORD;
BEGIN
  SELECT 
    pa.scheduled_date,
    pa.duration_minutes,
    t.name as treatment_name,
    p.first_name || ' ' || p.last_name as patient_name,
    pa.pre_treatment_notes
  INTO appointment_record
  FROM public.patient_appointments pa
  JOIN public.treatments t ON pa.treatment_id = t.id
  JOIN public.patients p ON pa.patient_id = p.id
  WHERE pa.id = appointment_id_param;
  
  IF appointment_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  ics_content := 'BEGIN:VCALENDAR' || E'\r\n' ||
    'VERSION:2.0' || E'\r\n' ||
    'PRODID:-//Your Clinic//Medical Appointment//EN' || E'\r\n' ||
    'BEGIN:VEVENT' || E'\r\n' ||
    'UID:' || appointment_id_param || '@yourclinic.com' || E'\r\n' ||
    'DTSTART:' || to_char(appointment_record.scheduled_date AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"') || E'\r\n' ||
    'DTEND:' || to_char((appointment_record.scheduled_date + INTERVAL '1 minute' * COALESCE(appointment_record.duration_minutes, 60)) AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"') || E'\r\n' ||
    'SUMMARY:' || appointment_record.treatment_name || ' - ' || appointment_record.patient_name || E'\r\n' ||
    'DESCRIPTION:Zabieg: ' || appointment_record.treatment_name || 
    CASE WHEN appointment_record.pre_treatment_notes IS NOT NULL 
         THEN E'\r\nNotatki: ' || appointment_record.pre_treatment_notes 
         ELSE '' END || E'\r\n' ||
    'LOCATION:Twoja Klinika' || E'\r\n' ||
    'STATUS:CONFIRMED' || E'\r\n' ||
    'BEGIN:VALARM' || E'\r\n' ||
    'TRIGGER:-PT60M' || E'\r\n' ||
    'ACTION:DISPLAY' || E'\r\n' ||
    'DESCRIPTION:Przypomnienie o zabiegu za godzinę' || E'\r\n' ||
    'END:VALARM' || E'\r\n' ||
    'END:VEVENT' || E'\r\n' ||
    'END:VCALENDAR';
    
  RETURN ics_content;
END;
$$;
