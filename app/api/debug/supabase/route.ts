// app/api/debug/supabase/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(v: string | undefined | null) {
  if (!v) return null;
  if (v.length <= 10) return "***";
  return `${v.slice(0, 6)}...${v.slice(-4)}`;
}

function getSecret(req: Request) {
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret") || "";
  const headerSecret = req.headers.get("x-debug-secret") || "";
  return querySecret || headerSecret;
}

export async function GET(req: Request) {
  const provided = getSecret(req);
  const expected = process.env.DEBUG_SECRET || "";

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "DEBUG_SECRET is missing in env" },
      { status: 500 }
    );
  }

  if (provided !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Supabase env vars",
        supabaseUrlPresent: !!supabaseUrl,
        anonKeyPresent: !!anonKey,
      },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // no op in debug
      },
      remove() {
        // no op in debug
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json(
    {
      ok: true,
      env: {
        supabaseUrl: mask(process.env.NEXT_PUBLIC_SUPABASE_URL),
        anonKey: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        serviceRoleKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      auth: {
        hasUser: !!data?.user,
        userId: data?.user?.id || null,
        email: data?.user?.email || null,
        error: error?.message || null,
      },
    },
    { status: 200 }
  );
}

// Optional, so you can also POST if you want
export async function POST(req: Request) {
  return GET(req);
}
