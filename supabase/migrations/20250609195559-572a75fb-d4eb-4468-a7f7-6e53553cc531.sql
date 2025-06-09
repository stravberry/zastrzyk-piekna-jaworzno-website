
-- Przypisanie roli admin dla użytkownika admin@admin.pl
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@admin.pl'
ON CONFLICT (user_id, role) DO NOTHING;
