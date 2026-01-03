import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNextParam(pathname: string) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) return "/";
  return pathname;
}

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next();

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

  const isAdminArea = pathname.startsWith("/admin");
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendors-chat") ||
    pathname.startsWith("/dashboard");

  const isAdminLogin = pathname === "/admin/login";
  const isPublicLogin = pathname === "/public/login";
  const isForgotPassword = pathname === "/public/forgot-password";

  const isSignup =
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/register";

  const isAuthPage = isAdminLogin || isPublicLogin || isForgotPassword || isSignup;

  const loginPath = isAdminArea ? "/admin/login" : "/public/login";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = loginPath;
    loginUrl.searchParams.set("next", safeNextParam(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = isAdminArea ? "/admin/dashboard" : "/vision";
    return NextResponse.redirect(redirectUrl);
  }

  if (!user) return res;

  let profile: any = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single();

    profile = data;
  } catch {
    profile = null;
  }

  const onboardingCompleted = Boolean(profile?.onboarding_completed);

  if (!onboardingCompleted) {
    if (isAdminArea) {
      if (!pathname.startsWith("/admin/dashboard/vendors/onboarding")) {
        const onboardingUrl = req.nextUrl.clone();
        onboardingUrl.pathname = "/admin/dashboard/vendors/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }
    } else {
      if (!pathname.startsWith("/onboarding")) {
        const onboardingUrl = req.nextUrl.clone();
        onboardingUrl.pathname = "/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendors-chat/:path*",
    "/dashboard/:path*",
    "/public/login",
    "/public/forgot-password",
    "/signup/:path*",
    "/register",
  ],
};
