
-- Funkcja do pobierania wszystkich użytkowników z ich rolami
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  email_confirmed_at timestamp with time zone,
  roles text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(
      ARRAY_AGG(ur.role::text) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY['user']
    ) as roles
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at
  ORDER BY u.created_at DESC
$$;

-- Funkcja do sprawdzania czy użytkownik może zarządzać innymi użytkownikami
CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Funkcja do usuwania roli użytkownika
CREATE OR REPLACE FUNCTION public.remove_user_role(target_user_id uuid, target_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sprawdź czy użytkownik może zarządzać rolami
  IF NOT public.can_manage_users() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Nie pozwól na usunięcie ostatniej roli admin
  IF target_role = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user';
    END IF;
  END IF;
  
  -- Usuń rolę
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = target_role;
  
  -- Loguj aktywność
  PERFORM public.log_admin_activity(
    'remove_role',
    'user_role',
    target_user_id::text,
    jsonb_build_object('role', target_role)
  );
  
  RETURN TRUE;
END;
$$;

-- Funkcja do dodawania użytkownika (dla adminów)
CREATE OR REPLACE FUNCTION public.invite_user(user_email text, user_role app_role DEFAULT 'user')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Sprawdź uprawnienia
  IF NOT public.can_manage_users() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Sprawdź czy email już istnieje
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;
  
  -- Tutaj w rzeczywistej aplikacji użylibyśmy Supabase Auth API
  -- Na razie zwracamy placeholder
  new_user_id := gen_random_uuid();
  
  -- Loguj aktywność
  PERFORM public.log_admin_activity(
    'invite_user',
    'user',
    new_user_id::text,
    jsonb_build_object('email', user_email, 'role', user_role)
  );
  
  RETURN new_user_id;
END;
$$;
