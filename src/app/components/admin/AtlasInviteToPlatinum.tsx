"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AtlasInviteToPlatinum({
  leadId,
  alreadyInvited,
}: {
  leadId: string;
  alreadyInvited?: boolean;
}) {
  const [sending, setSending] = useState(false);

  const sendInvite = async () => {
    if (sending || alreadyInvited) return;

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Update lead
      await supabase
        .from("vendor_leads")
        .update({
          stage: "invited",
          stage_entered_at: new Date().toISOString(),
          invited_at: new Date().toISOString(),
          invite_sent_by: user.id,
        })
        .eq("id", leadId);

      // Audit log
      await supabase.from("lead_audit_logs").insert({
        lead_id: leadId,
        changed_by: user.id,
        full_name: user.user_metadata?.full_name || "System",
        action_type: "INVITE_SENT",
        old_value: null,
        new_value: "Platinum Invitation Sent",
      });
    } catch (err) {
      console.error("Invite failed", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={sendInvite}
      disabled={sending || alreadyInvited}
      className={`w-full rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest transition
        ${
          alreadyInvited
            ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
            : "bg-[#183F34] text-white hover:opacity-90"
        }`}
    >
      {alreadyInvited ? "Invitation Sent" : "Invite to Platinum"}
    </button>
  );
}
