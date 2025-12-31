type RiskInput = {
  stage: string | null
  probability: number
  assigned_to: string | null
  invited_at: string | null
  updated_at?: string | null
  assigned_at?: string | null
  priority_overridden?: boolean | null
  stage_entered_at?: string | null
}

export function calculateRiskSignal(lead: RiskInput): number {
  let risk = 0
  const now = Date.now()

  /* ---------------------------------
     Helper: days since timestamp
  ---------------------------------- */
  const daysSince = (date?: string | null) => {
    if (!date) return null
    return (now - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  }

  const daysSinceUpdate = daysSince(lead.updated_at)
  const daysSinceAssigned = daysSince(lead.assigned_at)
  const daysSinceInvite = daysSince(lead.invited_at)
  const daysSinceStageChange = daysSince(lead.stage_entered_at)

  /* ---------------------------------
     1. Inactivity decay
  ---------------------------------- */
  if (daysSinceUpdate !== null && daysSinceUpdate > 7) {
    risk += 30
  }

  /* ---------------------------------
     2. High intent stuck in qualification
  ---------------------------------- */
  if (lead.stage === "qualification" && lead.probability > 0.6) {
    risk += 20
  }

  /* ---------------------------------
     3. Assigned but ignored
  ---------------------------------- */
  if (
    lead.assigned_to &&
    daysSinceAssigned !== null &&
    daysSinceAssigned > 5
  ) {
    risk += 20
  }

  /* ---------------------------------
     4. Invited but no follow-up
  ---------------------------------- */
  if (
    lead.stage === "invited" &&
    daysSinceInvite !== null &&
    daysSinceInvite > 7
  ) {
    risk += 30
  }

  /* ---------------------------------
     5. Human override with no movement
  ---------------------------------- */
  if (
    lead.priority_overridden &&
    daysSinceStageChange !== null &&
    daysSinceStageChange > 7
  ) {
    risk += 20
  }

  /* ---------------------------------
     Clamp score
  ---------------------------------- */
  return Math.min(100, Math.round(risk))
}
