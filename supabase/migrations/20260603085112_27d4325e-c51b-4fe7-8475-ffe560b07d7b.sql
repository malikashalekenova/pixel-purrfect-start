DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = true) AS
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

-- Allow the leaderboard view (running as caller) to read those rows from profiles
CREATE POLICY "Anyone can view leaderboard columns of profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Re-grant SELECT to anon on profiles is NOT needed: view runs as caller (anon),
-- but anon needs table-level SELECT to read the underlying rows. Grant minimal:
GRANT SELECT (id, username, display_name, xp, level, contracts_completed, total_earned)
ON public.profiles TO anon, authenticated;
