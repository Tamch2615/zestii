import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Clock, User } from "lucide-react";
import { categoryLabel } from "@/lib/recipes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RecipeCardData {
  id: string;
  title: string;
  description: string | null;
  prep_time_minutes: number;
  categories: string[];
  image_url: string | null;
  author?: { username: string } | null;
}

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast.info("რეცეპტის შესანახად გაიარეთ ავტორიზაცია");
        await navigate({ to: "/auth" });
        return;
      }

      const { data: existing, error: readError } = await supabase
        .from("saved_recipes")
        .select("recipe_id")
        .eq("user_id", userData.user.id)
        .eq("recipe_id", recipe.id)
        .maybeSingle();
      if (readError) throw readError;

      if (existing) {
        const { error } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", userData.user.id)
          .eq("recipe_id", recipe.id);
        if (error) throw error;
        setIsSaved(false);
        toast.success("რეცეპტი წაიშალა შენახულებიდან");
      } else {
        const { error } = await supabase.from("saved_recipes").insert({
          user_id: userData.user.id,
          recipe_id: recipe.id,
        });
        if (error) throw error;
        setIsSaved(true);
        toast.success("რეცეპტი შენახულია!");
      }

      queryClient.invalidateQueries({ queryKey: ["recipes", "saved"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "რეცეპტის შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-primary/5 bg-card transition-transform hover:-translate-y-1 hover:shadow-lg">
      <Link to="/recipes/$id" params={{ id: recipe.id }} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-brand-secondary/20 to-primary/10 text-4xl">
              🍽️
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {recipe.categories.slice(0, 2).map((c) => (
              <span
                key={c}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary"
              >
                {categoryLabel(c)}
              </span>
            ))}
          </div>
          <h3 className="mb-2 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {recipe.prep_time_minutes} წთ
            </span>
            {recipe.author?.username && (
              <span className="flex items-center gap-1">
                <User className="size-3.5" /> {recipe.author.username}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={toggleSave}
        disabled={saving}
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-full border border-border bg-background/95 text-foreground shadow-md backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        aria-label={isSaved ? "შენახულებიდან წაშლა" : "რეცეპტის შენახვა"}
        title={isSaved ? "შენახულებიდან წაშლა" : "რეცეპტის შენახვა"}
      >
        {isSaved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
      </button>
    </article>
  );
}
