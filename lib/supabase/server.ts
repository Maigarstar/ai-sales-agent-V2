import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function isThenable(x: any): x is Promise<any> {
  return !!x && (typeof x === "object" || typeof x === "function") && typeof x.then === "function";
}

async function resolveMaybePromise<T>(value: T | Promise<T>): Promise<T> {
  return isThenable(value) ? await value : (value as T);
}

function parseCookieHeader(raw: string | null): Array<{ name: string; value: string }> {
  if (!raw) return [];
  return raw
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return { name: part, value: "" };
      return { name: part.slice(0, idx).trim(), value: part.slice(idx + 1).trim() };
    })
    .filter((c) => c.name.length > 0);
}

export async function createClient() {
  const supabaseUrl = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const cookieStoreAny: any = await resolveMaybePromise((cookies as any)());
  const headerStoreAny: any = await resolveMaybePromise((headers as any)());

  const getAll = () => {
    try {
      if (cookieStoreAny && typeof cookieStoreAny.getAll === "function") {
        return cookieStoreAny.getAll().map((c: any) => ({ name: c.name, value: c.value }));
      }

      if (cookieStoreAny && typeof cookieStoreAny.get === "function") {
        const names = ["sb-access-token", "sb-refresh-token"];
        return names
          .map((n) => {
            const v = cookieStoreAny.get(n)?.value;
            return v ? { name: n, value: v } : null;
          })
          .filter(Boolean) as Array<{ name: string; value: string }>;
      }

      const rawCookie =
        headerStoreAny && typeof headerStoreAny.get === "function"
          ? headerStoreAny.get("cookie")
          : headerStoreAny && typeof headerStoreAny.getAll === "function"
            ? headerStoreAny.getAll("cookie")?.join("; ")
            : null;

      return parseCookieHeader(rawCookie);
    } catch {
      return [];
    }
  };

  const setAll = (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
    try {
      if (!cookieStoreAny || typeof cookieStoreAny.set !== "function") return;

      for (const c of cookiesToSet) {
        cookieStoreAny.set({
          name: c.name,
          value: c.value,
          ...(c.options || {}),
        });
      }
    } catch {
      return;
    }
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll,
      setAll,
    },
  });
}
