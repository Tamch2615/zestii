import { createFileRoute } from "@tanstack/react-router";
import { RecipeForm } from "./edit-recipe.$id";

export const Route = createFileRoute("/_authenticated/new-recipe")({
  head: () => ({ meta: [{ title: "ახალი რეცეპტი · ზესტი" }] }),
  component: () => <RecipeForm />,
});
