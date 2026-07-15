import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel } from "@/lib/recipes";
import { RecipeCard, type RecipeCardData } from "@/components/RecipeCard";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const label = categoryLabel(params.slug);
    return {
      meta: [
        { title: `${label} — გემოვანი` },
        { name: "description", content: `${label} კატეგორიის რეცეპტები გემოვანზე.` },
      ],
    };
  },
  loader: ({ params }) => {
    if (!CATEGORIES.find((c) => c.slug === params.slug)) throw notFound();
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const label = categoryLabel(slug);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes", "category", slug],
    queryFn: async (): Promise<RecipeCardData[]> => {
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "id, title, description, prep_time_minutes, categories, image_url, author:profiles!recipes_author_id_profiles_fkey(username)",
        )
        .contains("categories", [slug])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RecipeCardData[];
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              c.slug === slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary"
            }`}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      <h1 className="mb-8 font-serif text-4xl font-bold">
        <span className="italic text-primary">{label}</span> — რეცეპტები
      </h1>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border-2 border-dashed border-border py-16 text-center font-serif text-2xl italic text-primary">
          ამ კატეგორიაში ჯერ არაფერია
        </p>
      )}
    </main>
  );
}
