import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ავტორიზაცია · ზესტი" },
      { name: "description", content: "შედი ან დარეგისტრირდი გემოვანზე." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("არასწორი ელფოსტა").max(255);
const passwordSchema = z.string().min(6, "მინიმუმ 6 სიმბოლო").max(72);
const usernameSchema = z
  .string()
  .trim()
  .min(2, "მინიმუმ 2 სიმბოლო")
  .max(30, "მაქსიმუმ 30 სიმბოლო")
  .regex(/^[\u10A0-\u10FF\u2D00-\u2D2Fa-zA-Z0-9_\s-]+$/, "მხოლოდ ქართული, ლათინური, ციფრები");

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profile" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailR = emailSchema.safeParse(email);
      const passR = passwordSchema.safeParse(password);
      if (!emailR.success) return toast.error(emailR.error.issues[0].message);
      if (!passR.success) return toast.error(passR.error.issues[0].message);

      if (mode === "signup") {
        const nameR = usernameSchema.safeParse(username);
        if (!nameR.success) return toast.error(nameR.error.issues[0].message);
        const { data, error } = await supabase.auth.signUp({
          email: emailR.data,
          password: passR.data,
          options: {
            data: { username: nameR.data },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("რეგისტრაცია წარმატებულია!");
          navigate({ to: "/profile" });
        } else {
          toast.success("ანგარიში შეიქმნა. დაადასტურეთ ელფოსტა და შემდეგ შედით.");
          setMode("signin");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailR.data,
          password: passR.data,
        });
        if (error) throw error;
        if (!data.session) throw new Error("სესიის შექმნა ვერ მოხერხდა");
        toast.success("კეთილი იყოს თქვენი დაბრუნება!");
        navigate({ to: "/profile" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "შეცდომა";
      toast.error(
        msg.includes("Invalid login")
          ? "არასწორი ელფოსტა ან პაროლი. საჭიროების შემთხვევაში აღადგინეთ პაროლი."
          : msg.includes("already registered")
            ? "ეს ელფოსტა უკვე დარეგისტრირებულია"
            : msg.includes("Email not confirmed")
              ? "ელფოსტა ჯერ არ არის დადასტურებული"
            : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-serif text-3xl italic text-primary">
          ზესტი
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <h1 className="mb-2 font-serif text-2xl font-bold">
            {mode === "signin" ? "შესვლა" : "რეგისტრაცია"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signin"
              ? "შედი შენს ანგარიშში და გააგრძელე შენი კულინარიული ბლოგი."
              : "შექმენი ანგარიში და დაიწყე რეცეპტების გაზიარება."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">მომხმარებლის სახელი</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="მაგ: ნინო კულინარი"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">ელფოსტა</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium" htmlFor="password">
                  პაროლი
                </label>
                {mode === "signin" && (
                  <Link
                    to="/reset-password"
                    search={{ request: true }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    დაგავიწყდა პაროლი?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="მინიმუმ 6 სიმბოლო"
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
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
              {loading ? "იტვირთება..." : mode === "signin" ? "შესვლა" : "რეგისტრაცია"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "არ გაქვს ანგარიში?" : "უკვე გაქვს ანგარიში?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "დარეგისტრირდი" : "შედი"}
            </button>
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← მთავარზე დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  );
}
