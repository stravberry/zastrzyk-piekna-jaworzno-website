
-- Create blog_post_views table for tracking article views
CREATE TABLE public.blog_post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id integer NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  unique_views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id)
);

-- Add view_count column to blog_posts for quick access
ALTER TABLE public.blog_posts 
ADD COLUMN view_count integer DEFAULT 0;

-- Enable RLS on blog_post_views
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_post_views
CREATE POLICY "Everyone can read blog post views" 
ON public.blog_post_views 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can update blog post views" 
ON public.blog_post_views 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_blog_post_views(post_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update view count
  INSERT INTO public.blog_post_views (post_id, views, unique_views)
  VALUES (post_id, 1, 1)
  ON CONFLICT (post_id) 
  DO UPDATE SET 
    views = blog_post_views.views + 1,
    updated_at = now();
    
  -- Update the blog_posts table view_count for quick access
  UPDATE public.blog_posts 
  SET view_count = (
    SELECT views FROM public.blog_post_views WHERE blog_post_views.post_id = public.blog_posts.id
  )
  WHERE id = post_id;
END;
$$;
