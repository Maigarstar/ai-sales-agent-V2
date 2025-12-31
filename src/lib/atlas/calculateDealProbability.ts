type LeadInput = {
  score: number | null
  priority: string | null
  priority_overridden: boolean | null
  stage: string | null
  intent_timing: string | null
  assigned_to: string | null
  invited_at: string | null
  updated_at?: string | null
}

export function calculateDealProbability(lead: LeadInput): number {
  let probability = 0

  /* ---------------------------------
     1. BASE SCORE (FOUNDATION)
  ---------------------------------- */
  const score = lead.score ?? 0
  probability = score / 100

  /* ---------------------------------
     2. PRIORITY WEIGHTING
  ---------------------------------- */
  if (lead.priority === "HOT") probability += 0.15
  if (lead.priority === "WARM") probability += 0.05
  if (lead.priority === "COLD") probability -= 0.15

  /* ---------------------------------
     3. HUMAN CONFIDENCE SIGNAL
     (manual override = belief)
  ---------------------------------- */
  if (lead.priority_overridden) probability += 0.10

  /* ---------------------------------
     4. STAGE MOMENTUM
  ---------------------------------- */
  if (lead.stage === "invited") probability += 0.20
  if (lead.stage === "handoff") probability += 0.10
  if (lead.stage === "closed") probability = 1

  /* ---------------------------------
     5. INVITATION SIGNAL
     (explicit commercial intent)
  ---------------------------------- */
  if (lead.invited_at) probability += 0.10

  /* ---------------------------------
     6. INTENT TIMING
  ---------------------------------- */
  if (lead.intent_timing === "immediate") probability += 0.15

  /* ---------------------------------
     7. OWNERSHIP SIGNAL
     (someone is accountable)
  ---------------------------------- */
  if (lead.assigned_to) probability += 0.10

  /* ---------------------------------
     8. STALENESS PENALTY
     (deal decay after 7 days)
  ---------------------------------- */
  if (lead.updated_at) {
    const lastUpdate = new Date(lead.updated_at).getTime()
    const daysInactive = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24)

    if (daysInactive > 7) probability -= 0.25
    if (daysInactive > 14) probability -= 0.15
  }

  /* ---------------------------------
     9. LUXURY FORECAST BOUNDS
     (never absolute, never zero)
  ---------------------------------- */
  probability = Math.max(0.05, Math.min(0.95, probability))

  /* ---------------------------------
     10. RETURN AS PERCENT
  ---------------------------------- */
  return Math.round(probability * 100)
}
