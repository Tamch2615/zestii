
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_author_id_profiles_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
