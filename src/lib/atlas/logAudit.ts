import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logAtlasAudit({
  leadId,
  action,
  oldValue,
  newValue,
  actor,
}: {
  leadId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  actor: string;
}) {
  await supabase.from("atlas_audit_log").insert({
    lead_id: leadId,
    action,
    old_value: oldValue,
    new_value: newValue,
    actor,
  });
}
