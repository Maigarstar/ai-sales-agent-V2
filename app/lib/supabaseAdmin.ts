// app/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js"

export function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""

  if (!supabaseUrl || !serviceKey) return null

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
