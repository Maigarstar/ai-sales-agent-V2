import { createBrowserClient } from '@supabase/ssr'

// This must be named 'createClient' to match the new import in your LoginPage
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}