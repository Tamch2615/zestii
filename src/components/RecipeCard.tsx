import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export interface RecipeCardData {
  id: string;
  title: string;
  description?: string | null;
  prep_time_minutes: number;
  categories: string[];
  image_url?: string | null;
  author?: {
    username?: string | null;
  } | null;
}

// 🖼️ სათაურის მიხედვით სწორი ფოტოს არჩევის ლოგიკა public/ საქაღალდიდან
function getRecipeImage(title: string, imageUrl?: string | null): string {
  if (imageUrl && !imageUrl.includes("lovable-uploads") && !imageUrl.includes("asset.json")) {
    return imageUrl;
  }

  const t = title.toLowerCase();

  if (t.includes("აჭარული") || t.includes("ხაჭაპური")) return "/acharuli-khachapuri.jpg";
  if (t.includes("ხინკალი")) return "/khinkali.jpg";
  if (t.includes("ლობიო")) return "/lobio-pot.webp";
  if (t.includes("ფხალი")) return "/spinach-pkhali.jpeg";
  if (t.includes("ბადრიჯანი")) return "/walnut-eggplant.jpg";
  if (t.includes("ტყემალი")) return "/green-tkemali.jpg";
  if (t.includes("ფელამუში")) return "/pelamushi.webp";
  if (t.includes("ჩურჩხელა")) return "/churchkhela-walnut.jpeg";
  if (t.includes("ავოკადო") || t.includes("ტოსტი")) return "/EWL-267169-avocado-egg-toast-Hero-01-9385a3b6112b409b944e04d1cb6a9733.jpg";

  return "/hero-food.jpg"; // Default fallback photo
}

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const imageSrc = getRecipeImage(recipe.title, recipe.image_url);

  return (
    <Link
      to="/recipe/$id"
      params={{ id: recipe.id }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="mb-2 font-serif text-xl font-bold text-foreground group-hover:text-primary">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-primary" />
            <span>{recipe.prep_time_minutes} წუთი</span>
          </div>
          {recipe.author?.username && (
            <span>ავტორი: {recipe.author.username}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
