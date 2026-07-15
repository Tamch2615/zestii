import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/recipes";
import { RecipeCard, type RecipeCardData } from "@/components/RecipeCard";
import heroImg from "@/assets/hero-food.jpg";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "გემოვანი — აღმოაჩინე ქართული გემოები" },
      {
        name: "description",
        content:
          "პერსონალური კულინარიული ბლოგი: საუზმე, სადილი, ვახშამი, დესერტი და სასმელი. ატვირთე, გააზიარე და შეინახე რეცეპტები.",
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
        .select("id, title, description, prep_time_minutes, categories, image_url, author:profiles!recipes_author_id_profiles_fkey(username)")
        .order("created_at", { ascending: false })
        .limit(9);
      if (error) throw error;
      return (data ?? []) as unknown as RecipeCardData[];
    },
  });

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-secondary">
              პერსონალური კულინარიული სივრცე
            </p>
            <h1 className="mb-6 font-serif text-5xl leading-tight text-foreground md:text-6xl">
              აღმოაჩინე ახალი <span className="italic text-primary">გემოები</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-muted-foreground">
              ატვირთე შენი საოჯახო რეცეპტები, აღმოაჩინე სხვების საიდუმლოებანი და
              შეინახე საყვარელი კერძები ერთ ადგილას.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Search className="size-4" />
                ჭკვიანი ძებნა ინგრედიენტებით
              </Link>
              <Link
                to="/new-recipe"
                className="inline-flex items-center gap-2 rounded-xl border border-foreground/20 bg-background px-6 py-3 font-semibold text-foreground hover:bg-accent"
              >
                + რეცეპტის დამატება
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="ქართული სუფრა"
              width={1600}
              height={1000}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl shadow-primary/20"
            />
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-background px-5 py-3 shadow-xl ring-1 ring-border md:-bottom-6 md:-left-6">
              <p className="font-serif text-lg italic text-primary">გემოვანი</p>
              <p className="text-xs text-muted-foreground">ქართული სამზარეულო</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl font-bold text-foreground">კატეგორიები</h2>
          <p className="text-sm text-muted-foreground">აირჩიე გემო, რასაც ეძებ</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span className="text-4xl transition-transform group-hover:scale-110">
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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-1 font-serif text-3xl font-bold text-foreground">
              ახალი რეცეპტები
            </h2>
            <p className="text-sm text-muted-foreground">
              საზოგადოების უახლესი გამოქვეყნებული კერძები
            </p>
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
              className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              დაამატე პირველი რეცეპტი
            </Link>
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="font-serif text-xl italic text-primary/60">გემოვანი</p>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            © 2026 — საბაკალავრო პროექტი (BIT-21.2025.G)
          </p>
        </div>
      </footer>
    </main>
  );
}
