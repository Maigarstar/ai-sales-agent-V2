import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * ENV
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * CLIENT SIDE SUPABASE
 * Use inside "use client" components only
 */
export function createBrowserSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * SERVER SIDE SUPABASE
 * Use inside Server Components and API routes
 */
export function createServerSupabase() {
  return createServerClient({
    cookies,
  });
}
