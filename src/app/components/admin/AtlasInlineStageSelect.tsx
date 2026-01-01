"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { calculateDealProbability } from "@/lib/atlas/calculateDealProbability";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  leadId: string;
  initialStage: string;
};

const STAGES = [
  "new",
  "qualification",
  "intent",
  "handoff",
  "closed",
] as const;

export default function AtlasInlineStageSelect({
  leadId,
  initialStage,
}: Props) {
  const [stage, setStage] = useState(initialStage);
  const [saving, setSaving] = useState(false);

  async function updateStage(newStage: string) {
    if (newStage === stage) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: lead } = await supabase
        .from("vendor_leads")
        .select(`
          score,
          priority,
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

      const previousStage = lead.stage ?? null;

      await supabase
        .from("vendor_leads")
        .update({
          stage: newStage,
          stage_entered_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      // 🔒 GUARANTEE REQUIRED FIELDS
      const safeLead = {
        ...lead,
        score: lead.score ?? 0,
        stage: newStage,
      };

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
        action_type: "stage_change",
        old_value: previousStage,
        new_value: newStage,
      });

      setStage(newStage);
    } catch (err) {
      console.error("Stage update failed", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={stage}
        onChange={(e) => updateStage(e.target.value)}
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
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
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
