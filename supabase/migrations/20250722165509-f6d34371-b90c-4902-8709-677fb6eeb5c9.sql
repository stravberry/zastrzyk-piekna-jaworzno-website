
-- Check if we need to add any missing columns to treatment_photos table
-- The table already exists with: id, appointment_id, photo_type, photo_url, description, taken_at, created_by, created_at

-- Add any missing columns that might be useful for the enhanced photo functionality
ALTER TABLE public.treatment_photos 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_before_photo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_after_photo boolean DEFAULT false;

-- Create storage bucket for treatment photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('treatment-photos', 'treatment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for treatment photos
CREATE POLICY IF NOT EXISTS "Authenticated users can upload treatment photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'treatment-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can view treatment photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'treatment-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can update treatment photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'treatment-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete treatment photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'treatment-photos');
