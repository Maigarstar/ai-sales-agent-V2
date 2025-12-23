import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type Role = "admin" | "vendor" | "couple" | "unknown";

function getRole(user: any): Role {
  const role =
    user?.app_metadata?.role ??
    user?.user_metadata?.role ??
    user?.user_metadata?.user_type ??
    null;

  if (role === "admin") return "admin";
  if (role === "vendor") return "vendor";
  if (role === "couple") return "couple";
  return "unknown";
}

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/signup")) return true;
  if (pathname.startsWith("/forgot-password")) return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

// CHANGED: Function name changed from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (isPublicPath(pathname)) {
    if (user && pathname.startsWith("/login")) {
      const role = getRole(user);
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/dashboard", request.url)
      );
    }
    return response;
  }

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const role = getRole(user);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};