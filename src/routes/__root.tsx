import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">გვერდი ვერ მოიძებნა</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          გვერდი, რომელსაც ეძებთ, არ არსებობს ან გადატანილია.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            მთავარზე დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-foreground">გვერდი ვერ ჩაიტვირთა</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          რაღაც შეცდომა მოხდა. სცადეთ ხელახლა ან დაბრუნდით მთავარზე.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ხელახლა ცდა
          </button>
          <a
            href="/"
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            მთავარი
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "გემოვანი — ქართული კულინარიული რეცეპტების ბლოგი" },
      {
        name: "description",
        content:
          "პერსონალური და ინტერაქტიული კულინარიული პლატფორმა: ატვირთე შენი რეცეპტები, აღმოაჩინე ახალი გემოები, დაიმახსოვრე საყვარელი კერძები.",
      },
      { name: "author", content: "გემოვანი" },
      { property: "og:title", content: "გემოვანი — ქართული კულინარიული ბლოგი" },
      { property: "og:description", content: "შენი პერსონალური კულინარიული სივრცე ქართული რეცეპტებისთვის." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700&family=Noto+Serif+Georgian:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? undefined });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="font-serif text-2xl italic tracking-tight text-primary">
          გემოვანი
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary">
            მთავარი
          </Link>
          <Link
            to="/search"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            ჭკვიანი ძებნა
          </Link>
          {user ? (
            <>
              <Link
                to="/new-recipe"
                className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-primary md:inline-flex"
              >
                + ახალი რეცეპტი
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-brand-secondary/40 bg-brand-secondary/10 px-3 py-1.5 hover:bg-brand-secondary/20"
              >
                <span className="grid size-7 place-items-center rounded-full bg-brand-secondary/30 text-xs font-bold text-primary">
                  {user.email?.[0]?.toUpperCase() ?? "მ"}
                </span>
                <span className="hidden text-sm font-semibold md:inline">ჩემი გვერდი</span>
              </Link>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              ავტორიზაცია
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
