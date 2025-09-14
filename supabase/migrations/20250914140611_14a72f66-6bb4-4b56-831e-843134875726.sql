-- Create table for storing contact replies
CREATE TABLE IF NOT EXISTS public.contact_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_submission_id UUID NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  to_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  email_id TEXT, -- Resend email ID
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by_ip TEXT,
  sent_by_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view contact replies"
ON public.contact_replies
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can create contact replies"
ON public.contact_replies
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update contact replies"
ON public.contact_replies
FOR UPDATE
USING (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_contact_replies_submission_id ON public.contact_replies(original_submission_id);
CREATE INDEX idx_contact_replies_created_at ON public.contact_replies(created_at DESC);