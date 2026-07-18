import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  request: z.boolean().optional().catch(false),
});

const emailSchema = z.string().trim().email("არასწორი ელფოსტა").max(255);
const passwordSchema = z.string().min(6, "მინიმუმ 6 სიმბოლო").max(72);

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "პაროლის აღდგენა · ზესტი" },
      { name: "description", content: "აღადგინეთ ზესტის ანგარიშის პაროლი." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    setRecoveryReady(hash.get("type") === "recovery");

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) return toast.error(result.error.issues[0].message);

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("პაროლის აღდგენის ბმული გამოგზავნილია");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ბმულის გაგზავნა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = passwordSchema.safeParse(password);
    if (!result.success) return toast.error(result.error.issues[0].message);

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: result.data });
      if (error) throw error;
      toast.success("პაროლი წარმატებით შეიცვალა");
      await navigate({ to: "/profile" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "პაროლის შეცვლა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-serif text-3xl italic">
          <span className="text-brand-secondary">ზეს</span>
          <span className="text-primary">ტი</span>
        </Link>
        <section className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <h1 className="mb-2 font-serif text-2xl font-bold">პაროლის აღდგენა</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {recoveryReady
              ? "შეიყვანეთ ახალი პაროლი თქვენი ანგარიშისთვის."
              : "მიუთითეთ რეგისტრაციისას გამოყენებული ელფოსტა."}
          </p>

          {recoveryReady ? (
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="new-password">
                  ახალი პაროლი
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="მინიმუმ 6 სიმბოლო"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
                    title={showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "იტვირთება..." : "პაროლის შეცვლა"}
              </button>
            </form>
          ) : (
            <form onSubmit={requestReset} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="recovery-email">
                  ელფოსტა
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "იგზავნება..." : "აღდგენის ბმულის გაგზავნა"}
              </button>
            </form>
          )}

          <Link
            to="/auth"
            className="mt-6 block text-center text-sm font-semibold text-primary hover:underline"
          >
            შესვლაზე დაბრუნება
          </Link>
        </section>
      </div>
    </main>
  );
}