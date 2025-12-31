/**
 * PHASE 3.2: PROBABILITY INTELLIGENCE
 * This logic removes human guesswork. 
 * As the Stage changes, the Weighted Forecast follows.
 */

export const STAGE_PROBABILITY_MAP: Record<string, number> = {
  "new": 10,           // Cold inquiry
  "qualification": 25, // Atlas is vetting
  "intent": 45,        // Aura score > 80
  "invited": 65,       // Platinum Invitation sent
  "negotiation": 85,   // Contract in review
  "won": 100,          // Deposit paid
  "lost": 0            // Closed out
};

export function calculateForecast(dealValue: number, stage: string): number {
  const probability = STAGE_PROBABILITY_MAP[stage] || 0;
  return dealValue * (probability / 100);
}