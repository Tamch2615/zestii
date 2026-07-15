import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard, type RecipeCardData } from "@/components/RecipeCard";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "ჭკვიანი ძებნა — გემოვანი" },
      { name: "description", content: "მონიშნე ინგრედიენტები და აღმოაჩინე შესაბამისი რეცეპტები." },
    ],
  }),
  component: SearchPage,
});

const POPULAR = [
  "პომიდორი", "ხახვი", "ნიორი", "ბადრიჯანი", "ნიგოზი", "ქინძი",
  "ბაზილიკი", "ბოსტნეული", "ხორცი", "ქათამი", "ყველი", "კვერცხი",
  "ფქვილი", "შაქარი", "რძე", "კარაქი", "პრასი", "წიწაკა", "ბროწეული",
];

function SearchPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const { data: allRecipes, isLoading } = useQuery({
    queryKey: ["recipes", "all-for-search"],
    queryFn: async (): Promise<(RecipeCardData & { ingredients: string[] })[]> => {
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "id, title, description, prep_time_minutes, categories, image_url, ingredients, author:profiles!recipes_author_id_profiles_fkey(username)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        ingredients: Array.isArray(r.ingredients) ? (r.ingredients as string[]) : [],
      })) as unknown as (RecipeCardData & { ingredients: string[] })[];
    },
  });

  const matched = useMemo(() => {
    if (!allRecipes) return [];
    if (selected.length === 0) return allRecipes;
    return allRecipes
      .map((r) => {
        const ingText = r.ingredients.join(" ").toLowerCase();
        const matches = selected.filter((s) => ingText.includes(s.toLowerCase())).length;
        return { r, matches };
      })
      .filter((x) => x.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .map((x) => x.r);
  }, [allRecipes, selected]);

  const toggle = (ing: string) =>
    setSelected((prev) => (prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]));

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const t = custom.trim();
    if (t && !selected.includes(t)) setSelected([...selected, t]);
    setCustom("");
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-secondary">
          ჭკვიანი ძებნა
        </p>
        <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
          რა გაქვს <span className="italic text-primary">მაცივარში?</span>
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          მონიშნე ის ინგრედიენტები, რაც გაქვს, და პლატფორმა შეგირჩევს რეცეპტებს
          სადაც ისინი გამოიყენება.
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={addCustom} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="დაწერე ინგრედიენტი..."
              className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            დამატება
          </button>
        </form>

        {selected.length > 0 && (
          <div className="mb-4 border-b border-border pb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              არჩეული:
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  {s} <X className="size-3.5" />
                </button>
              ))}
              <button
                onClick={() => setSelected([])}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive"
              >
                გასუფთავება
              </button>
            </div>
          </div>
        )}

        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          პოპულარული ინგრედიენტები:
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((ing) => {
            const active = selected.includes(ing);
            return (
              <button
                key={ing}
                onClick={() => toggle(ing)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary hover:text-primary"
                }`}
              >
                + {ing}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold">
          {selected.length === 0
            ? "ყველა რეცეპტი"
            : `ნაპოვნია ${matched.length} რეცეპტი`}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : matched.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {matched.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border-2 border-dashed border-border py-16 text-center font-serif text-2xl italic text-primary">
          {selected.length > 0
            ? "ამ ინგრედიენტებით რეცეპტი ვერ მოიძებნა"
            : "ჯერ არცერთი რეცეპტი არაა ატვირთული"}
        </p>
      )}
    </main>
  );
}
