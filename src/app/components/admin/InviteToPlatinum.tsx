"use client";

import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Crown } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InviteToPlatinum({ leadId }: { leadId: string }) {
  const [sending, setSending] = useState(false);

  async function invite() {
    if (sending) return;

    setSending(true);

    try {
      await supabase
        .from("vendor_leads")
        .update({
          platinum_invited_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      await writeAuditLog({
        leadId,
        actionType: "platinum_invite_sent",
        newValue: "invited",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      onClick={invite}
      disabled={sending}
      className="
        w-full
        rounded-3xl
        bg-[#C5A059]
        px-10 py-7
        flex items-center justify-center gap-4
        text-[11px]
        uppercase tracking-[0.35em]
        font-black
        text-black
        transition-all duration-300
        hover:brightness-105
        active:scale-[0.985]
        disabled:opacity-60
        disabled:cursor-not-allowed
        shadow-[0_12px_32px_rgba(0,0,0,0.14)]
      "
    >
      <Crown size={18} />
      {sending ? "Sending Invite" : "Invite to Platinum"}
    </button>
  );
}
