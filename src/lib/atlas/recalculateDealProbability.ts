import { createClient } from "@supabase/supabase-js"
import { calculateDealProbability } from "./calculateDealProbability"

/**
 * Recalculates and persists deal probability.
 * Call this ONLY after:
 * - priority change
 * - stage change
 * - assignment change
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function recalculateDealProbability(leadId: string): Promise<number | null> {
  try {
    // 1. Fetch fresh lead state
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
      console.warn("Probability recalculation skipped: lead not found", leadId)
      return null
    }

    // 2. Calculate probability (0–100)
    const probability = calculateDealProbability(lead)

    // 3. Persist result (store as 0–1 float)
    await supabase
      .from("vendor_leads")
      .update({
        deal_probability: probability / 100,
        probability_updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    return probability
  } catch (err) {
    console.error("Probability recalculation failed", err)
    return null
  }
}
