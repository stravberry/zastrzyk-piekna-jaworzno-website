-- Add is_published field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN is_published boolean NOT NULL DEFAULT true;

-- Add index for performance when filtering published posts
CREATE INDEX idx_blog_posts_is_published ON public.blog_posts(is_published);

-- Update existing posts to be published (maintains current state)
UPDATE public.blog_posts SET is_published = true WHERE is_published IS NULL;

-- Create or replace the view for published posts only
CREATE OR REPLACE VIEW public.published_blog_posts AS
SELECT * FROM public.blog_posts 
WHERE is_published = true
ORDER BY date DESC;