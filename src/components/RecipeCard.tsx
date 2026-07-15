import { Link } from "@tanstack/react-router";
import { Clock, User } from "lucide-react";
import { categoryLabel } from "@/lib/recipes";

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
  return (
    <Link
      to="/recipes/$id"
      params={{ id: recipe.id }}
      className="group block overflow-hidden rounded-3xl border border-primary/5 bg-card transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
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
  );
}
