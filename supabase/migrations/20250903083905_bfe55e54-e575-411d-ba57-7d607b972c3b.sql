-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.published_blog_posts;

CREATE VIEW public.published_blog_posts 
WITH (security_invoker = true) AS
SELECT * FROM public.blog_posts 
WHERE is_published = true
ORDER BY date DESC;