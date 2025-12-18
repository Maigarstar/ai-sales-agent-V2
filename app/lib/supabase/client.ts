import { createClient } from "@supabase/supabase-js"

function mustGetEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

export function createSupabaseBrowserClient() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL")
  const anonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
