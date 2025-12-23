import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ✅ Safe redirect helper
function safeNextParam(pathname: string) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/";
  }
  return pathname;
}

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ✅ Skip Supabase setup if no env vars (useful for local builds)
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next();

  // ✅ Prepare NextResponse so Supabase can set cookies properly
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const pathname = req.nextUrl.pathname;

  // ✅ Define route types
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendors-chat") ||
    pathname.startsWith("/dashboard");

  const isLoginPage =
    pathname === "/admin/login" || pathname === "/login";

  // ✅ Skip middleware on public routes
  if (!isProtected) return res;

  // ✅ Get user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // ✅ Silent session refresh (if token expired)
  if (!user && error?.message?.includes("Invalid Refresh Token")) {
    console.warn("Refreshing Supabase session silently...");
    await supabase.auth.refreshSession();
  }

  // ✅ Redirect unauthenticated users
  if (!user && !isLoginPage) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", safeNextParam(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Allow login page if not authenticated
  if (!user && isLoginPage) return res;

  // ✅ Fetch user profile for onboarding logic
  let profile = null;
  if (user) {
    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profileError) profile = data;
    } catch (err) {
      console.error("Middleware profile fetch failed:", err);
    }
  }

  // ✅ Enforce onboarding for authenticated users
  if (user && profile && !profile.onboarding_completed) {
    // Prevent infinite loop
    if (!pathname.startsWith("/admin/onboarding")) {
      const onboardingUrl = req.nextUrl.clone();
      onboardingUrl.pathname = "/admin/onboarding/identity-manifest";
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // ✅ Smart Redirect: Fully onboarded users skip login & onboarding
  if (user && profile?.onboarding_completed) {
    if (isLoginPage || pathname.startsWith("/admin/onboarding")) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = "/admin/dashboard/overview";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return res;
}

// ✅ Match only key protected routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/vendors-chat/:path*",
    "/dashboard/:path*",
    "/login",
    "/admin/login",
  ],
};
