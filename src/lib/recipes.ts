import { z } from "zod";

export const CATEGORIES = [
  { slug: "breakfast", label: "საუზმე", emoji: "🥐" },
  { slug: "lunch", label: "სადილი", emoji: "🍲" },
  { slug: "dinner", label: "ვახშამი", emoji: "🍽️" },
  { slug: "dessert", label: "დესერტი", emoji: "🍰" },
  { slug: "drink", label: "სასმელი", emoji: "🥤" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

// Georgian-only validation: allow Georgian letters, digits, whitespace, and basic punctuation.
// U+10A0–U+10FF (Georgian), U+2D00–U+2D2F (Georgian Supplement)
const georgianRe = /^[\u10A0-\u10FF\u2D00-\u2D2F0-9\s.,!?;:()\-–—"„""''\n\r/%]+$/;

export const georgianText = (max = 500) =>
  z
    .string()
    .trim()
    .min(1, "ეს ველი აუცილებელია")
    .max(max, `მაქსიმუმ ${max} სიმბოლო`)
    .refine((v) => georgianRe.test(v), {
      message: "გთხოვთ, გამოიყენოთ მხოლოდ ქართული ენა",
    });

export const recipeSchema = z.object({
  title: georgianText(120),
  description: z
    .string()
    .trim()
    .max(500, "მაქსიმუმ 500 სიმბოლო")
    .refine((v) => v === "" || georgianRe.test(v), { message: "მხოლოდ ქართული ენა" })
    .optional()
    .default(""),
  ingredients: z
    .array(georgianText(120))
    .min(1, "მიუთითეთ მინიმუმ 1 ინგრედიენტი")
    .max(50),
  steps: z.array(georgianText(1000)).min(1, "მიუთითეთ მინიმუმ 1 საფეხური").max(30),
  prep_time_minutes: z.coerce
    .number({ invalid_type_error: "რიცხვი" })
    .int()
    .min(1, "მინიმუმ 1 წუთი")
    .max(1440, "მაქსიმუმ 24 საათი"),
  categories: z.array(z.string()).min(1, "აირჩიეთ მინიმუმ ერთი კატეგორია"),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
