import { createBrowserClient } from "@supabase/ssr";

/**
 * =========================================================
 * Supabase Browser Client
 * =========================================================
 * Used in client components only
 * Safe for Next.js App Router
 * =========================================================
 */

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(url, anonKey);
}
