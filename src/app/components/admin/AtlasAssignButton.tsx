"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AtlasAssignButton({
  leadId,
}: {
  leadId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function assign() {
    setLoading(true);

    await supabase
      .from("vendor_leads")
      .update({
        assigned_to: "marco",
        status: "handoff",
        handed_off_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    setLoading(false);
  }

  return (
    <button
      onClick={assign}
      disabled={loading}
      style={{
        padding: "10px 16px",
        borderRadius: 6,
        background: "#183F34",
        color: "white",
        fontSize: 13,
      }}
    >
      {loading ? "Assigning…" : "Assign to Marco"}
    </button>
  );
}
