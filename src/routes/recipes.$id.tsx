import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { categoryLabel } from "@/lib/recipes";

export const Route = createFileRoute("/recipes/$id")({
  head: ({ loaderData }: { loaderData?: { title?: string; description?: string } }) => ({
    meta: [
      { title: loaderData?.title ? `${loaderData.title} — გემოვანი` : "რეცეპტი — გემოვანი" },
      {
        name: "description",
        content: loaderData?.description ?? "ქართული კულინარიული რეცეპტი გემოვანზე",
      },
    ],
  }),
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("recipes")
      .select("title, description")
      .eq("id", params.id)
      .maybeSingle();
    return { title: data?.title ?? undefined, description: data?.description ?? undefined };
  },
  component: RecipeDetail,
});

function RecipeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(
          "*, author:profiles!recipes_author_id_fkey(username, bio)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: s } = await supabase
        .from("saved_recipes")
        .select("recipe_id")
        .eq("user_id", data.user.id)
        .eq("recipe_id", id)
        .maybeSingle();
      setIsSaved(Boolean(s));
    });
  }, [id]);

  const toggleSave = async () => {
    if (!userId) {
      toast.info("შესანახად უნდა შეხვიდე ანგარიშში");
      return navigate({ to: "/auth" });
    }
    if (isSaved) {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", id);
      if (error) return toast.error(error.message);
      setIsSaved(false);
      toast.success("რეცეპტი წაიშალა შენახულებიდან");
    } else {
      const { error } = await supabase
        .from("saved_recipes")
        .insert({ user_id: userId, recipe_id: id });
      if (error) return toast.error(error.message);
      setIsSaved(true);
      toast.success("რეცეპტი შენახულია!");
    }
    qc.invalidateQueries({ queryKey: ["recipes", "saved"] });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl animate-pulse space-y-6 px-6 py-12">
        <div className="h-96 rounded-3xl bg-muted" />
        <div className="h-10 w-2/3 rounded bg-muted" />
        <div className="h-6 w-1/3 rounded bg-muted" />
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <p className="font-serif text-2xl italic text-primary">რეცეპტი ვერ მოიძებნა</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          ← მთავარზე დაბრუნება
        </Link>
      </main>
    );
  }

  const ingredients = (recipe.ingredients as string[]) ?? [];
  const steps = (recipe.steps as string[]) ?? [];
  const isAuthor = userId === recipe.author_id;

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> უკან
      </Link>

      {recipe.image_url && (
        <div className="mb-8 overflow-hidden rounded-3xl">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(recipe.categories ?? []).map((c: string) => (
          <Link
            key={c}
            to="/category/$slug"
            params={{ slug: c }}
            className="rounded-full bg-brand-secondary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary hover:bg-brand-secondary/30"
          >
            {categoryLabel(c)}
          </Link>
        ))}
      </div>

      <h1 className="mb-4 font-serif text-5xl font-bold leading-tight">{recipe.title}</h1>

      <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-border pb-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {recipe.prep_time_minutes} წუთი
        </span>
        {recipe.author?.username && (
          <span className="flex items-center gap-1.5">
            <User className="size-4" /> {recipe.author.username}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {isAuthor && (
            <Link
              to="/edit-recipe/$id"
              params={{ id }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              რედაქტირება
            </Link>
          )}
          <button
            onClick={toggleSave}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isSaved
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border bg-background hover:bg-accent"
            }`}
          >
            {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            {isSaved ? "შენახულია" : "შენახვა"}
          </button>
        </div>
      </div>

      {recipe.description && (
        <p className="mb-10 font-serif text-lg italic leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
      )}

      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="mb-4 font-serif text-2xl font-bold">ინგრედიენტები</h2>
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-2xl font-bold">მომზადება</h2>
          <ol className="space-y-4">
            {steps.map((st, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="pt-1.5 leading-relaxed">{st}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
