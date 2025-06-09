
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin());

-- Update blog_posts RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.blog_posts;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.blog_posts;

-- Enable RLS on blog_posts if not already enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- New blog_posts policies with admin/editor permissions
CREATE POLICY "Everyone can read blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins and editors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Only admins and editors can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Only admins and editors can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'editor'::app_role)
);

-- Update blog_post_views policies
DROP POLICY IF EXISTS "Only authenticated users can update blog post views" ON public.blog_post_views;

CREATE POLICY "Authenticated users can update blog post views" 
ON public.blog_post_views 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Update other admin tables with proper RLS
ALTER TABLE public.pricing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read pricing categories" 
ON public.pricing_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage pricing categories" 
ON public.pricing_categories 
FOR ALL 
USING (public.is_admin());

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read gallery images" 
ON public.gallery_images 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage gallery images" 
ON public.gallery_images 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Everyone can read gallery categories" 
ON public.gallery_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage gallery categories" 
ON public.gallery_categories 
FOR ALL 
USING (public.is_admin());

-- Update code_settings policies
DROP POLICY IF EXISTS "Allow authenticated select" ON public.code_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.code_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.code_settings;

CREATE POLICY "Allow admins to select code settings" 
ON public.code_settings 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Allow admins to update code settings" 
ON public.code_settings 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Allow admins to insert code settings" 
ON public.code_settings 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Create admin activity log table
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view activity log" 
ON public.admin_activity_log 
FOR SELECT 
USING (public.is_admin());

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _action text,
  _resource_type text DEFAULT NULL,
  _resource_id text DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _details
  );
END;
$$;
