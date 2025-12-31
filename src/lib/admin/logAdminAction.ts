import { createClient } from "@/lib/supabase/client";

export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: any;
}) {
  const supabase = createClient();

  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId || null,
    admin_email: adminEmail || null,
    action,
    target_type: targetType,
    target_id: targetId || null,
    metadata,
  });
}
