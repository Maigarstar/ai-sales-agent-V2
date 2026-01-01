"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { calculateDealProbability } from "@/lib/atlas/calculateDealProbability";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRIORITIES = ["HOT", "WARM", "COLD"] as const;

type Props = {
  leadId: string;
  initialPriority: string;
};

export default function AtlasInlinePrioritySelect({
  leadId,
  initialPriority,
}: Props) {
  const [priority, setPriority] = useState(initialPriority);
  const [saving, setSaving] = useState(false);

  async function updatePriority(newPriority: string) {
    if (newPriority === priority) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: lead } = await supabase
        .from("vendor_leads")
        .select(`
          priority,
          score,
          priority_overridden,
          stage,
          intent_timing,
          assigned_to,
          invited_at,
          updated_at
        `)
        .eq("id", leadId)
        .single();

      if (!lead) {
        throw new Error("Lead not found");
      }

      // 🔒 GUARANTEE required fields
      const safeLead = {
        ...lead,
        score: lead.score ?? 0,
        priority: newPriority,
        priority_overridden: true,
      };

      const previousPriority = lead.priority ?? null;

      await supabase
        .from("vendor_leads")
        .update({
          priority: newPriority,
          priority_previous: previousPriority,
          priority_overridden: true,
          priority_updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      const probability = calculateDealProbability(safeLead);

      await supabase
        .from("vendor_leads")
        .update({
          deal_probability: probability / 100,
        })
        .eq("id", leadId);

      await supabase.from("lead_audit_logs").insert({
        lead_id: leadId,
        changed_by: user?.id ?? null,
        full_name: user?.user_metadata?.full_name || "System",
        action_type: "priority_override",
        old_value: previousPriority,
        new_value: newPriority,
      });

      setPriority(newPriority);
    } catch (err) {
      console.error("Priority update failed", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={priority}
        onChange={(e) => updatePriority(e.target.value)}
        disabled={saving}
        className="
          block w-full
          rounded-2xl
          border border-[#E5E5E1]
          bg-white
          px-5 py-4
          text-sm font-medium
          tracking-wide
          focus:outline-none
          focus:ring-1 focus:ring-[#C5A059]
          disabled:opacity-60
        "
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {saving && (
        <div className="absolute -bottom-5 left-1 text-[10px] text-black/40">
          Saving…
        </div>
      )}
    </div>
  );
}
