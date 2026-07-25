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
  const t = title.toLowerCase();

  // 1. ვამოწმებთ სათაურებს და ვუსვამთ public/ საქაღალდის ფოტოებს:
  if (t.includes("ხაჭაპური") || t.includes("აჭარული")) return "/acharuli-khachapuri.jpg";
  if (t.includes("ხინკალი")) return "/khinkali.jpg";
  if (t.includes("ლობიო")) return "/lobio-pot.webp";
  if (t.includes("ფხალი")) return "/spinach-pkhali.jpeg";
  if (t.includes("ბადრიჯანი")) return "/walnut-eggplant.jpg";
  if (t.includes("ტყემალი")) return "/green-tkemali.jpg";
  if (t.includes("ფელამუში")) return "/pelamushi.webp";
  if (t.includes("ჩურჩხელა")) return "/churchkhela-walnut.jpeg";
  if (t.includes("ავოკადო") || t.includes("ტოსტი")) return "/EWL-267169-avocado-egg-toast-Hero-01-9385a3b6112b409b944e04d1cb6a9733.jpg";
  if (t.includes("ბერძნული") || t.includes("სალათი")) return "/greek-salad.jpg";
  if (t.includes("ჩიქენ") || t.includes("ინდური") || t.includes("ტიკა")) return "/chicken-tikka.jpg";

  // 2. თუ ჩვეულებრივი ლოკალური ფოტოა, რომელსაც / ეწყება
  if (imageUrl && imageUrl.startsWith("/")) return imageUrl;

  // 3. სათადარიგო ფოტო
  return "/hero-food.jpg";
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
