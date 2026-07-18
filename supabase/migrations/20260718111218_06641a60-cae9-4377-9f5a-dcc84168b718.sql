INSERT INTO public.profiles (id, username)
SELECT
  u.id,
  COALESCE(NULLIF(BTRIM(u.raw_user_meta_data->>'username'), ''), split_part(u.email, '@', 1), 'მომხმარებელი')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;