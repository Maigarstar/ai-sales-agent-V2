import { createClient } from "@supabase/supabase-js"
import { calculateDealProbability } from "./calculateDealProbability"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateDealProbability(leadId: string) {
  // 1. Fetch lead
  const { data: lead, error } = await supabase
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
    .single()

  if (error || !lead) {
    console.error("Probability update failed: lead not found", error)
    return
  }

  // 2. Calculate probability
  const probability = calculateDealProbability(lead)

  // 3. Persist
  await supabase
    .from("vendor_leads")
    .update({
      deal_probability: probability,
      probability_updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
}
