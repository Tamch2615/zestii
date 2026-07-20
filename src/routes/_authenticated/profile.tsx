import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard, type RecipeCardData } from "@/components/RecipeCard";
import { toast } from "sonner";
import { LogOut, Pencil, Trash2, Plus, Upload, Loader2, X } from "lucide-react";
import { categoryLabel } from "@/lib/recipes";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "ჩემი გვერდი · ზესტი" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"mine" | "saved">("mine");

  const [editOpen, setEditOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: myRecipes, isLoading: loadingMine } = useQuery({
    queryKey: ["recipes", "mine", user.id],
    queryFn: async (): Promise<RecipeCardData[]> => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, description, prep_time_minutes, categories, image_url")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RecipeCardData[];
    },
  });

  const { data: saved, isLoading: loadingSaved } = useQuery({
    queryKey: ["recipes", "saved", user.id],
    queryFn: async (): Promise<RecipeCardData[]> => {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select(
          "recipe:recipes(id, title, description, prep_time_minutes, categories, image_url, author:profiles!recipes_author_id_profiles_fkey(username))",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => r.recipe as unknown as RecipeCardData).filter(Boolean);
    },
  });

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ, რომ გსურთ რეცეპტის წაშლა?")) return;
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("რეცეპტი წაიშალა");
    qc.invalidateQueries({ queryKey: ["recipes"] });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Profile header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card p-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username ?? "avatar"}
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-full bg-brand-secondary/20 font-serif text-3xl font-bold text-primary">
              {profile?.username?.[0] ?? "მ"}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold">
              {profile?.username ?? "მომხმარებელი"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {myRecipes?.length ?? 0} რეცეპტი • {saved?.length ?? 0} შენახული
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Pencil className="size-4" /> პროფილის რედაქტირება
          </button>
          <Link
            to="/new-recipe"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> ახალი რეცეპტი
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <LogOut className="size-4" /> გამოსვლა
          </button>
        </div>
      </div>

      {editOpen && (
        <EditProfileDialog
          userId={user.id}
          initialUsername={profile?.username ?? ""}
          initialAvatar={profile?.avatar_url ?? ""}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["profile", user.id] });
            setEditOpen(false);
          }}
        />
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-border">
        <button
          onClick={() => setTab("mine")}
          className={`pb-3 text-sm font-bold transition-colors ${
            tab === "mine"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ჩემი რეცეპტები
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`pb-3 text-sm font-bold transition-colors ${
            tab === "saved"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          შენახული რეცეპტები
        </button>
      </div>

      {/* Content */}
      {tab === "mine" ? (
        loadingMine ? (
          <SkeletonGrid />
        ) : myRecipes && myRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myRecipes.map((r) => (
              <div key={r.id} className="group relative">
                <RecipeCard recipe={r} />
                <div className="absolute right-3 top-3 flex gap-1 rounded-lg bg-background/95 p-1 opacity-0 shadow-lg ring-1 ring-border transition-opacity group-hover:opacity-100">
                  <Link
                    to="/edit-recipe/$id"
                    params={{ id: r.id }}
                    className="grid size-8 place-items-center rounded-md hover:bg-accent"
                    title="რედაქტირება"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="grid size-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                    title="წაშლა"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-primary"
                    >
                      #{categoryLabel(c)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="ჯერ არაფერი გაქვს ატვირთული"
            body="დაიწყე შენი კულინარიული ბლოგი. გააზიარე პირველი რეცეპტი."
            cta={{ to: "/new-recipe", label: "ახალი რეცეპტი" }}
          />
        )
      ) : loadingSaved ? (
        <SkeletonGrid />
      ) : saved && saved.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {saved.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="შენახული რეცეპტები არ გაქვს"
          body="მოძებნე რეცეპტები და დაიმახსოვრე მოგვიანებით."
          cta={{ to: "/", label: "დაათვალიერე რეცეპტები" }}
        />
      )}
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border py-16 text-center">
      <p className="mb-2 font-serif text-2xl italic text-primary">{title}</p>
      <p className="mb-6 text-muted-foreground">{body}</p>
      <Link
        to={cta.to}
        className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function EditProfileDialog({
  userId,
  initialUsername,
  initialAvatar,
  onClose,
  onSaved,
}: {
  userId: string;
  initialUsername: string;
  initialAvatar: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("გთხოვთ, აირჩიოთ სურათი");
    if (file.size > 5 * 1024 * 1024) return toast.error("ფაილი 5MB-ზე მეტია");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
      if (signErr) throw signErr;
      setAvatarUrl(signed.signedUrl);
      toast.success("ავატარი აიტვირთა");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const name = username.trim();
    if (name.length < 3 || name.length > 30) {
      return toast.error("Username უნდა იყოს 3-30 სიმბოლო");
    }
    setSaving(true);
    try {
      if (name !== initialUsername) {
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", name)
          .neq("id", userId)
          .maybeSingle();
        if (taken) {
          setSaving(false);
          return toast.error("ეს username უკვე დაკავებულია");
        }
      }
      const { error } = await supabase
        .from("profiles")
        .update({ username: name, avatar_url: avatarUrl || null })
        .eq("id", userId);
      if (error) throw error;
      toast.success("პროფილი განახლდა");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">პროფილის რედაქტირება</h2>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg hover:bg-accent"
            aria-label="დახურვა"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-5 flex flex-col items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="size-24 rounded-full object-cover" />
          ) : (
            <div className="grid size-24 place-items-center rounded-full bg-brand-secondary/20 font-serif text-4xl font-bold text-primary">
              {username[0] ?? "მ"}
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">
            {uploading ? (
              <><Loader2 className="size-4 animate-spin" /> იტვირთება...</>
            ) : (
              <><Upload className="size-4" /> ფოტოს შეცვლა</>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                e.target.value = "";
              }}
            />
          </label>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl("")}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              ავატარის მოშორება
            </button>
          )}
        </div>

        <label className="mb-1.5 block text-sm font-semibold">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="შენი username"
          maxLength={30}
        />

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving || uploading}
            className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "იტვირთება..." : "შენახვა"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  );
}
