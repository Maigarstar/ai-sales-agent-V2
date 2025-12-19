import { createBrowserClient } from "@supabase/ssr"

/**
 * Standard Supabase client for Next.js 16.
 * Standardizing the name to 'createClient' to match your component imports.
 */
export function createClient() {
  // We don't need a throw-error helper here because @supabase/ssr 
  // will warn you if these are missing, but keeping it clean for the build.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}