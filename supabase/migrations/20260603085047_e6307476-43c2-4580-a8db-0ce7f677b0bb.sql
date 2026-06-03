-- 1) Restrict EXECUTE on internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies and must remain callable by authenticated users
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2) Replace the wide-open SELECT policy on profiles with own-row visibility
DROP POLICY IF EXISTS "Profiles viewable by everyone (leaderboard)" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Revoke broad anon read; leaderboard goes through the view below
REVOKE SELECT ON public.profiles FROM anon;

-- 3) Public leaderboard view — only safe columns, no coins / reputation / gang_leader
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = false) AS
SELECT
  id,
  username,
  display_name,
  xp,
  level,
  contracts_completed,
  total_earned
FROM public.profiles
ORDER BY xp DESC
LIMIT 200;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
