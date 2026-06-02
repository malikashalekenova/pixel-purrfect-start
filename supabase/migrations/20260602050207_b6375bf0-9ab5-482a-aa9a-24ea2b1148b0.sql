ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS fur_color TEXT NOT NULL DEFAULT 'orange',
  ADD COLUMN IF NOT EXISTS eye_color TEXT NOT NULL DEFAULT 'green',
  ADD COLUMN IF NOT EXISTS clothing TEXT NOT NULL DEFAULT 'hoodie',
  ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS reputation INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS gang TEXT,
  ADD COLUMN IF NOT EXISTS gang_leader BOOLEAN NOT NULL DEFAULT false;

-- Update auto-create trigger to apply new defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, coins, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'Игрок'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    50,
    1
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
