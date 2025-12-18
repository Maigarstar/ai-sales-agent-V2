import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        for (const c of cookiesToSet) {
          res.cookies.set(c.name, c.value, c.options);
        }
      },
    },
  });

  // Refresh session if present
  await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected =
    path.startsWith("/wedding-concierge") ||
    path.startsWith("/onboarding");

  if (isProtected) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const url = req.nextUrl.clone();
      url.pathname = "/signup";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/wedding-concierge/:path*", "/onboarding/:path*"],
};
