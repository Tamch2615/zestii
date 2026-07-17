import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/recipes";
import { RecipeCard, type RecipeCardData } from "@/components/RecipeCard";
import heroAsset from "@/assets/hero-food-new.jpg.asset.json";
const heroImg = heroAsset.url;
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ზესტი. ილუსტრირებული კულინარიული წიგნი" },
      {
        name: "description",
        content:
          "ზესტი. საერთაშორისო რეცეპტების ილუსტრირებული კრებული ქართულად: საუზმე, სადილი, ვახშამი, დესერტი და სასმელები.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes", "latest"],
    queryFn: async (): Promise<RecipeCardData[]> => {
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "id, title, description, prep_time_minutes, categories, image_url, author:profiles!recipes_author_id_profiles_fkey(username)",
        )
        .order("created_at", { ascending: false })
        .limit(9);
      if (error) throw error;
      return (data ?? []) as unknown as RecipeCardData[];
    },
  });

  return (
    <main className="min-h-screen">
      {/* Hero — illustrated cookbook cover */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1fr_1.1fr] md:items-center md:py-20">
          {/* Left: sage stripe + editorial title */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -left-6 top-0 hidden h-full w-3 bg-primary md:block"
            />
            <p className="mb-4 font-serif text-sm italic text-primary">კულინარიული ბლოგი</p>
            <h1 className="mb-2 font-serif text-6xl font-bold leading-[0.95] text-foreground md:text-[6rem]">
              <span className="italic text-brand-secondary">ზეს</span>
              <span className="italic text-primary">ტი</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              საერთაშორისო რეცეპტების ილუსტრირებული კრებული ქართულ ენაზე. საუზმიდან
              ვახშმამდე, დესერტიდან სასმელამდე. ატვირთე შენი საოჯახო რეცეპტი, აღმოაჩინე
              ახალი გემო, შეინახე ის, რაც შეგიყვარდა.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Search className="size-4" />
                ინგრედიენტებით ძებნა
              </Link>
              <Link
                to="/new-recipe"
                className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-6 py-3 font-bold text-foreground hover:bg-foreground hover:text-background"
              >
                + რეცეპტის დამატება
              </Link>
            </div>
          </div>

          {/* Right: illustrated cover */}
          <div className="relative">
            <div className="relative rounded-[2rem] border border-border bg-card p-4 shadow-[0_30px_80px_-30px_rgba(90,60,30,0.35)] md:p-6">
              <img
                src={heroImg}
                alt="ილუსტრირებული საერთაშორისო სუფრა"
                width={1408}
                height={1104}
                className="aspect-[5/4] w-full rounded-[1.4rem] object-cover"
              />
              <div className="mt-4 flex items-baseline justify-between px-2">
                <p className="font-serif text-xs italic text-muted-foreground">little book of recipes</p>
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -right-3 -top-3 hidden size-16 rounded-full bg-mustard/80 md:block"
            />
            <div
              aria-hidden
              className="absolute -bottom-3 -left-3 hidden size-10 rounded-full bg-brand-secondary/80 md:block"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <h2 className="font-serif text-4xl font-bold text-foreground">
            <span className="italic text-primary">კატეგორიები</span>
          </h2>
          <p className="hidden text-sm italic text-muted-foreground md:inline">
            აირჩიე გემო, რასაც ეძებ
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <span className="text-5xl transition-transform group-hover:scale-110">
                {c.emoji}
              </span>
              <span className="font-serif text-lg font-bold text-foreground group-hover:text-primary">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Recipes */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary">
              fresh from the kitchen
            </p>
            <h2 className="font-serif text-4xl font-bold text-foreground">ახალი რეცეპტები</h2>
          </div>
        </div>

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
          <div className="rounded-3xl border-2 border-dashed border-border py-16 text-center">
            <p className="mb-2 font-serif text-2xl italic text-primary">ჯერ არაფერია</p>
            <p className="mb-6 text-muted-foreground">
              იყავი პირველი, ვინც გააზიარებს რეცეპტს ჩვენს პლატფორმაზე!
            </p>
            <Link
              to="/new-recipe"
              className="inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
            >
              დაამატე პირველი რეცეპტი
            </Link>
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="font-serif text-2xl italic">
            <span className="text-brand-secondary">ზეს</span>
            <span className="text-primary">ტი</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
            © 2026 · საბაკალავრო პროექტი (BIT-21.2025.G)
          </p>
        </div>
      </footer>
    </main>
  );
}
