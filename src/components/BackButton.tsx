import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };
  return (
    <button
      onClick={goBack}
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary ${className}`}
    >
      <ArrowLeft className="size-4" />
      უკან დაბრუნება
    </button>
  );
}
