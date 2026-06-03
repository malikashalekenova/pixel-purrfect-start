
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_signup();

INSERT INTO public.profiles (user_id, username, display_name, coins, level)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1), 'Игрок'),
       COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
       50, 1
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) = 'malikashalekenova@gmail.com'
ON CONFLICT DO NOTHING;
