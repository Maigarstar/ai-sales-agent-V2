import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNextParam(pathname: string) {
  if (!pathname) return "/";
  if (!pathname.startsWith("/")) return "/";
  if (pathname.startsWith("//")) return "/";
  return pathname;
}

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env not present, do nothing (useful in certain build envs)
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next();

  // Prepare response so Supabase can set cookies
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

  /* =============================
     ROUTE FLAGS
  ============================= */

  const isAdminArea = pathname.startsWith("/admin");

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vendors-chat");

  // Canonical auth routes
  const isLogin = pathname === "/login";
  const isAdminLogin = pathname === "/admin/login";

  // Legacy auth routes (keep for redirects / backwards compatibility)
  const isLegacyPublicLogin = pathname === "/public/login";
  const isLegacyForgotPassword = pathname === "/public/forgot-password";

  // Signup routes
  const isSignup =
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/register";

  const isAuthPage =
    isLogin ||
    isAdminLogin ||
    isLegacyPublicLogin ||
    isLegacyForgotPassword ||
    isSignup;

  // Where we send unauthenticated users when they hit protected pages
  const loginPath = isAdminArea ? "/admin/login" : "/login";

  /* =============================
     GET USER
  ============================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* =============================
     1) PROTECT PRIVATE AREAS
  ============================= */

  if (!user && isProtected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = loginPath;
    loginUrl.searchParams.set("next", safeNextParam(pathname));
    return NextResponse.redirect(loginUrl);
  }

  /* =============================
     2) LOGGED IN USERS SHOULD NOT SEE AUTH PAGES
  ============================= */

  if (user && isAuthPage) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = isAdminArea ? "/admin/dashboard" : "/vision";
    return NextResponse.redirect(redirectUrl);
  }

  // If no user and not protected, let it through (including /login)
  if (!user) return res;

  /* =============================
     3) ONBOARDING ENFORCEMENT
  ============================= */

  let profile: { onboarding_completed?: boolean; role?: string } | null = null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single();

    profile = data || null;
  } catch {
    profile = null;
  }

  const onboardingCompleted = Boolean(profile?.onboarding_completed);

  if (!onboardingCompleted) {
    if (isAdminArea) {
      // Vendor onboarding flow inside admin
      if (!pathname.startsWith("/admin/dashboard/vendors/onboarding")) {
        const onboardingUrl = req.nextUrl.clone();
        onboardingUrl.pathname = "/admin/dashboard/vendors/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }
    } else {
      // Couples onboarding flow
      if (!pathname.startsWith("/onboarding")) {
        const onboardingUrl = req.nextUrl.clone();
        onboardingUrl.pathname = "/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  return res;
}

/* =============================
   MATCH ONLY WHAT NEEDS IT
   Include /login so "logged-in user hits /login" can redirect them
============================= */

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/vendors-chat/:path*",

    "/login",
    "/admin/login",

    "/public/login",
    "/public/forgot-password",

    "/signup",
    "/signup/:path*",
    "/register",
  ],
};
