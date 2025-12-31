import { createClient } from "@supabase/supabase-js";

export async function writeAuditLog({
  leadId,
  userId,
  fullName,
  actionType,
  oldValue,
  newValue,
}: {
  leadId: string;
  userId?: string;
  fullName?: string;
  actionType: string;
  oldValue?: string;
  newValue?: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("lead_audit_logs").insert({
    lead_id: leadId,
    changed_by: userId || null,
    full_name: fullName || "System",
    action_type: actionType,
    old_value: oldValue || null,
    new_value: newValue || null,
  });
}
