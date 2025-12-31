"use server"

import { createClient } from "@supabase/supabase-js"
import { calculateDealProbability } from "src/lib/atlas/calculateDealProbability"
import { calculateRiskSignal } from "src/lib/atlas/calculateRiskSignal"

export async function recalculateLeadSignals(lead: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const probability = calculateDealProbability(lead)

  const risk = calculateRiskSignal({
    ...lead,
    probability,
  })

  await supabase
    .from("vendor_leads")
    .update({
      deal_probability: probability / 100,
      risk_score: risk,
      risk_updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id)
}
