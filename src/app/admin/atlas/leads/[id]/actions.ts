"use server";

import { createClient } from "@supabase/supabase-js";

export async function addInternalNote(
  leadId: string,
  formData: FormData
) {
  const note = formData.get("note")?.toString();
  if (!note) return;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorName =
    user?.user_metadata?.full_name || "System";

  // 1. Save note
  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    note,
    author_id: user?.id || null,
    author_name: authorName,
  });

  // 2. Audit trail
  await supabase.from("lead_audit_logs").insert({
    lead_id: leadId,
    changed_by: user?.id || null,
    full_name: authorName,
    action_type: "internal_note_added",
    old_value: null,
    new_value: "Note added",
  });
}
