-- Drop the permissive policy added in previous migration — it re-opened everything
DROP POLICY IF EXISTS "Anyone can view leaderboard columns of profiles" ON public.profiles;

-- Remove column-level grants (they only widen access)
REVOKE SELECT ON public.profiles FROM anon;
-- authenticated keeps full SELECT but RLS limits it to own row (policy "Users can view own profile")

-- Recreate leaderboard view as SECURITY DEFINER so it can read safe columns
-- from profiles regardless of RLS, exposing only non-sensitive fields.
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = false, security_barrier = true) AS
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
