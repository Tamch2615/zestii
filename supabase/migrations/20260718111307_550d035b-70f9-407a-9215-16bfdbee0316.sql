UPDATE public.recipes
SET
  title = REPLACE(REPLACE(title, '—', '.'), '–', '-'),
  description = CASE WHEN description IS NULL THEN NULL ELSE REPLACE(REPLACE(description, '—', '.'), '–', '-') END,
  ingredients = REPLACE(REPLACE(ingredients::text, '—', '.'), '–', '-')::jsonb,
  steps = REPLACE(REPLACE(steps::text, '—', '.'), '–', '-')::jsonb,
  updated_at = now()
WHERE
  title LIKE '%—%' OR title LIKE '%–%' OR
  description LIKE '%—%' OR description LIKE '%–%' OR
  ingredients::text LIKE '%—%' OR ingredients::text LIKE '%–%' OR
  steps::text LIKE '%—%' OR steps::text LIKE '%–%';