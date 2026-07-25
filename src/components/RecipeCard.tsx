import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { categoryLabel } from "@/lib/recipes";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    prep_time_minutes: number;
    categories?: string[] | null;
  };
}

function getRecipeImage(title: string, imageUrl?: string | null): string {
  // თუ ბაზის ლინკი გაფუჭებული Lovable/Supabase Storage-ის ლინკია, უგულებელვყოფთ!
  const isBrokenUrl =
    !imageUrl ||
    imageUrl.includes("lovable-uploads") ||
    imageUrl.includes("supabase.co") ||
    imageUrl.includes("asset.json");

  if (!isBrokenUrl) {
    return imageUrl;
  }

  const t = title.toLowerCase();

  // 100%-ით მომუშავე Unsplash / ლოკალური ფოტოები
  if (t.includes("ხაჭაპური") || t.includes("აჭარული"))
    return "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80";
  if (t.includes("ხინკალი"))
    return "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80";
  if (t.includes("ლობიო"))
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80";
  if (t.includes("ფხალი"))
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";
  if (t.includes("ბადრიჯანი"))
    return "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=800&q=80";
  if (t.includes("ტყემალი"))
    return "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80";
  if (t.includes("სალათი") || t.includes("ბერძნული"))
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";

  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imgSrc = getRecipeImage(recipe.title, recipe.image_url);

  return (
    <Link
      to="/recipes/$id"
      params={{ id: recipe.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={recipe.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="mb-2 flex flex-wrap gap-1">
            {(recipe.categories ?? []).map((c) => (
              <span
                key={c}
                className="text-[10px] font-bold uppercase tracking-wider text-primary/80"
              >
                {categoryLabel(c)}
              </span>
            ))}
          </div>
          <h3 className="mb-2 font-serif text-2xl font-bold leading-snug group-hover:text-primary">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{recipe.prep_time_minutes} წუთი</span>
        </div>
      </div>
    </Link>
  );
}
