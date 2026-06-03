-- Restrict UPDATE on profiles to cosmetic columns only to prevent privilege escalation
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, username, fur_color, eye_color, clothing) ON public.profiles TO authenticated;