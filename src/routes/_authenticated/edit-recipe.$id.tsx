import { createFileRoute, useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CATEGORIES, recipeSchema } from "@/lib/recipes";
import { X, Plus, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/edit-recipe/$id")({
  head: () => ({ meta: [{ title: "რეცეპტის რედაქტირება · ზესტი" }] }),
  component: EditRecipe,
});

function EditRecipe() {
  return <RecipeForm />;
}

// Shared form used by both new-recipe and edit-recipe
export function RecipeForm({ initialId }: { initialId?: string } = {}) {
  const params = useParams({ strict: false }) as { id?: string };
  const id = initialId ?? params.id;
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useRouteContext({ from: "/_authenticated" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState<string>("30");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["recipe", "edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? "");
      setPrepTime(String(existing.prep_time_minutes));
      setIngredients(
        Array.isArray(existing.ingredients) && existing.ingredients.length > 0
          ? (existing.ingredients as string[])
          : [""],
      );
      setSteps(
        Array.isArray(existing.steps) && existing.steps.length > 0
          ? (existing.steps as string[])
          : [""],
      );
      setSelectedCats(existing.categories ?? []);
      setImageUrl(existing.image_url ?? "");
    }
  }, [existing]);

  const toggleCat = (slug: string) =>
    setSelectedCats((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));

  const setListItem = (list: string[], setter: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setter(next);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("გთხოვთ, აირჩიოთ სურათი");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("ფაილი 5MB-ზე მეტია");
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("recipe-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("recipe-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
      if (signErr) throw signErr;
      setImageUrl(signed.signedUrl);
      toast.success("სურათი აიტვირთა");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        prep_time_minutes: prepTime,
        ingredients: ingredients.map((s) => s.trim()).filter(Boolean),
        steps: steps.map((s) => s.trim()).filter(Boolean),
        categories: selectedCats,
        image_url: imageUrl.trim(),
      };
      const parsed = recipeSchema.safeParse(payload);
      if (!parsed.success) {
        return toast.error(parsed.error.issues[0].message);
      }

      const dbPayload = {
        title: parsed.data.title,
        description: parsed.data.description || null,
        prep_time_minutes: parsed.data.prep_time_minutes,
        ingredients: parsed.data.ingredients,
        steps: parsed.data.steps,
        categories: parsed.data.categories,
        image_url: parsed.data.image_url || null,
      };

      if (isEdit) {
        const { error } = await supabase.from("recipes").update(dbPayload).eq("id", id!);
        if (error) throw error;
        toast.success("რეცეპტი განახლდა");
        navigate({ to: "/recipes/$id", params: { id: id! } });
      } else {
        const { data, error } = await supabase
          .from("recipes")
          .insert({ ...dbPayload, author_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        toast.success("რეცეპტი გამოქვეყნდა!");
        navigate({ to: "/recipes/$id", params: { id: data.id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-serif text-4xl font-bold">
        {isEdit ? "რეცეპტის რედაქტირება" : "ახალი რეცეპტი"}
      </h1>
      <p className="mb-8 text-muted-foreground">
        შეავსე ველები ქართულ ენაზე. სისტემა ავტომატურად ამოწმებს ტექსტის სისწორეს.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <Field label="სათაური">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="მაგ: აჭარული ხაჭაპური"
            required
          />
        </Field>

        <Field label="მოკლე აღწერა (არასავალდებულო)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-20"
            placeholder="მოკლედ, რაზეა ეს რეცეპტი..."
          />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="მომზადების დრო (წუთი)">
            <input
              type="number"
              min={1}
              max={1440}
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="სურათის URL (არასავალდებულო)">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>
        </div>

        <Field label="კატეგორიები (აირჩიე ერთი ან რამდენიმე)">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedCats.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggleCat(c.slug)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="ინგრედიენტები">
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={ing}
                  onChange={(e) => setListItem(ingredients, setIngredients, i, e.target.value)}
                  className="input flex-1"
                  placeholder={`ინგრედიენტი ${i + 1}`}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                    className="grid size-11 place-items-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setIngredients([...ingredients, ""])}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <Plus className="size-4" /> ინგრედიენტის დამატება
            </button>
          </div>
        </Field>

        <Field label="მომზადების პროცესი">
          <div className="space-y-2">
            {steps.map((st, i) => (
              <div key={i} className="flex gap-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary font-serif font-bold text-primary">
                  {i + 1}
                </span>
                <textarea
                  value={st}
                  onChange={(e) => setListItem(steps, setSteps, i, e.target.value)}
                  className="input min-h-20 flex-1"
                  placeholder={`საფეხური ${i + 1}...`}
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                    className="grid size-11 shrink-0 place-items-center self-start rounded-lg border border-border text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps([...steps, ""])}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <Plus className="size-4" /> საფეხურის დამატება
            </button>
          </div>
        </Field>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "იტვირთება..." : isEdit ? "შენახვა" : "გამოქვეყნება"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" })}
            className="rounded-xl border border-border px-8 py-3 font-semibold hover:bg-accent"
          >
            გაუქმება
          </button>
        </div>
      </form>

      <style>{`.input { width:100%; border-radius: 12px; border: 1px solid var(--input); background: var(--background); padding: 10px 14px; font-size: 14px; outline: none; }
      .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent); }`}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}
