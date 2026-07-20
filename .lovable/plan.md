## რა დაემატება

### 1. სურათის ატვირთვა რეცეპტზე (კომპიუტერი/ტელეფონი)
- ახალი Storage bucket `recipe-images` (public read, authenticated write, მხოლოდ საკუთარი ფაილების წაშლა/განახლება path-ის მიხედვით `{user_id}/...`).
- `edit-recipe.$id.tsx`-ში URL input-ის გვერდით დაემატება `<input type="file" accept="image/*">` ღილაკი "ატვირთე ფოტო". მობილურზე ავტომატურად შემოთავაზდება კამერა/გალერეა.
- ატვირთვის შემდეგ ფაილი აიტვირთება bucket-ში, მიიღება public URL და ჩაისმება `imageUrl` state-ში (preview ჩანს ქვემოთ).
- ვალიდაცია: მაქს 5MB, მხოლოდ image/* MIME types.

### 2. პროფილის რედაქტირება
- `profiles` ცხრილს უკვე აქვს `avatar_url` და `username` — schema ცვლილება არ სჭირდება.
- Storage bucket `avatars` (public read, authenticated write path `{user_id}/...`).
- `profile.tsx`-ზე დაემატება "პროფილის რედაქტირება" ღილაკი, რომელიც გახსნის მოდალს (Dialog):
  - Avatar preview + "ფოტოს შეცვლა" file input.
  - Username input (validation: 3-30 სიმბოლო, unique — DB-ს unique constraint არ აქვს username-ზე, მაგრამ დავამატებთ client-side check-ს `.maybeSingle()`-ით).
  - "შენახვა" ღილაკი → `profiles` update + query invalidation.
- Avatar გამოჩნდება header-ის მრგვალ ავატარშიც (ასოს ნაცვლად თუ არსებობს `avatar_url`).

## ტექნიკური დეტალები

- Buckets შეიქმნება `supabase--storage_create_bucket` tool-ით (public=true).
- RLS policies `storage.objects`-ზე migration-ით: INSERT/UPDATE/DELETE მხოლოდ `auth.uid()::text = (storage.foldername(name))[1]`.
- Username uniqueness: არ ვამატებთ DB constraint-ს (არსებული duplicate-ები რომ არ გატყდეს), მხოლოდ client check.
- ფაილის სახელი: `{user_id}/{timestamp}-{random}.{ext}`.

## ცვლილებების ფაილები
- `src/routes/_authenticated/edit-recipe.$id.tsx` — file upload UI + handler.
- `src/routes/_authenticated/profile.tsx` — edit dialog, avatar preview.
- ახალი migration — 2 bucket + storage RLS policies.
