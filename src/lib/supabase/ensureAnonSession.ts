import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureAnonSession(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getSession();

  if (data?.session) return { ok: true };

  const { error } = await supabase.auth.signInAnonymously();

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
