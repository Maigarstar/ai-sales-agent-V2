"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { calculateDealProbability } from "@/lib/atlas/calculateDealProbability";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type User = {
  id: string;
  full_name: string;
};

type Props = {
  leadId: string;
  initialAssignedId?: string | null;
};

export default function AtlasLeadAssignment({
  leadId,
  initialAssignedId,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | null>(
    initialAssignedId || null
  );
  const [saving, setSaving] = useState(false);

  /* ---------------------------------
     LOAD INTERNAL USERS
  ---------------------------------- */
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["admin", "sales", "partnerships"])
        .eq("active", true)
        .order("full_name");

      setUsers(data || []);
    };

    loadUsers();
  }, []);

  /* ---------------------------------
     UPDATE ASSIGNMENT + PROBABILITY
  ---------------------------------- */
  const updateAssignment = async (userId: string | null) => {
    if (userId === assignedTo) return;

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
          invited_at,
          updated_at,
          assigned_to
        `)
        .eq("id", leadId)
        .single();

      if (!lead) {
        throw new Error("Lead not found");
      }

      const previousUser = users.find((u) => u.id === assignedTo);
      const nextUser = users.find((u) => u.id === userId);

      await supabase
        .from("vendor_leads")
        .update({
          assigned_to: userId,
          assigned_previous: assignedTo,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      // 🔒 GUARANTEE REQUIRED FIELDS
      const safeLead = {
        ...lead,
        score: lead.score ?? 0,
        assigned_to: userId,
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
        action_type: "assignment_update",
        old_value: previousUser?.full_name || "Unassigned",
        new_value: nextUser?.full_name || "Unassigned",
      });

      setAssignedTo(userId);
    } catch (err) {
      console.error("Assignment update failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={assignedTo || ""}
      onChange={(e) => updateAssignment(e.target.value || null)}
      disabled={saving}
      className="
        w-full
        rounded-2xl
        border border-[#E5E5E1]
        bg-white
        px-6 py-4
        text-sm font-medium
        focus:outline-none
        focus:ring-1
        focus:ring-[#C5A059]
        disabled:opacity-60
      "
    >
      <option value="">Unassigned</option>

      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.full_name}
        </option>
      ))}
    </select>
  );
}
