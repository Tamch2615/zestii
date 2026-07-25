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
  const t = title.trim();
  const lower = t.toLowerCase();

  // 1. ქართული კერძები
  if (lower.includes("ხაჭაპური") || lower.includes("აჭარული")) return "/acharuli-khachapuri.jpg";
  if (lower.includes("ხინკალი")) return "/khinkali.jpg";
  if (lower.includes("ლობიო")) return "/lobio-pot.webp";
  if (lower.includes("ფხალი")) return "/spinach-pkhali.jpeg";
  if (lower.includes("ბადრიჯანი")) return "/walnut-eggplant.jpg";
  if (lower.includes("ტყემალი") || lower.includes("ტკემალი")) return "/green-tkemali.jpg";
  if (lower.includes("ფელამუში")) return "/pelamushi.webp";
  if (lower.includes("ჩურჩხელა")) return "/churchkhela-walnut.jpeg";
  if (lower.includes("ჩახოხბილი")) return "/ჩახოხბილი ქათმით.jpg";
  if (lower.includes("ღვინო")) return "/ღვინო საფერავი.jpg";
  if (lower.includes("ტარხუნის")) return "/ტარხუნის ლიმონათი.jpg";

  // 2. უცხოური კერძები (ონლაინ გარანტირებული ფოტოები + public)
  if (lower.includes("ავოკადო") || lower.includes("ტოსტი")) return "/EWL-267169-avocado-egg-toast-Hero-01-9385a3b6112b409b944e04d1cb6a9733.jpg";
  if (lower.includes("ბერძნული") || lower.includes("სალათი")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("ჩიქენ") || lower.includes("ინდური") || lower.includes("ტიკა")) {
    return "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("ტაკო") || lower.includes("კარნიტასით")) return "/ტაკო კარნიტასით.jpg";
  if (lower.includes("ბლინი")) return "/ამერიკული ბლინი.jpg";
  if (lower.includes("მარტინი")) return "/ესპრესო მარტინი.webp";
  if (lower.includes("ვიეტნამური")) return "/ვიეტნამური ფო ბო.jpg";
  if (lower.includes("შაქშუკა")) return "/თურქული შაქშუკა.jpeg";
  if (lower.includes("მაწონი")) return "/მაწონი ხილით.jpg";
  if (lower.includes("კარბონარა")) return "/პასტა კარბონარა.jpg";
  if (lower.includes("მარგარიტა") || lower.includes("პიცა")) return "/პიცა მარგარიტა.jpg";
  if (lower.includes("სუში")) return "/სუში ლოსოსით.jpeg";
  if (lower.includes("ტირამისუ")) return "/ტირამისუ.jpg";
  if (lower.includes("კრუასანი")) return "/ფრანგული კრუასანი.jpg";

  // 3. თუ ლოკალური ფოტოა
  if (imageUrl && imageUrl.startsWith("/")) return imageUrl;

  // 4. სათადარიგო
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
