-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a keep-alive ping cron job that runs every 3 days at 6:00 UTC
-- This will prevent Supabase from pausing the project due to inactivity
SELECT cron.schedule(
  'keep-alive-ping',
  '0 6 */3 * *', -- Every 3 days at 6:00 UTC
  $$
  SELECT
    net.http_post(
        url:='https://ubwrbituvkmlthvjosrv.supabase.co/functions/v1/keep-alive-ping',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '", "source": "cron"}')::jsonb
    ) as request_id;
  $$
);

-- Create a table to log keep-alive activity (optional, for monitoring)
CREATE TABLE IF NOT EXISTS public.keep_alive_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the log table
ALTER TABLE public.keep_alive_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view keep-alive logs
CREATE POLICY "Admins can view keep-alive logs" ON public.keep_alive_log
  FOR SELECT USING (is_admin());

-- Create policy for system to insert keep-alive logs
CREATE POLICY "System can insert keep-alive logs" ON public.keep_alive_log
  FOR INSERT WITH CHECK (true);