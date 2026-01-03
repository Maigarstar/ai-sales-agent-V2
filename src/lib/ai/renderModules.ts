export function renderBrandVoice(brandVoice: any) {
  if (!brandVoice) return "";

  const adjectives = brandVoice.adjectives?.join(", ") || "";

  return `
Brand voice:
Use a ${brandVoice.tone} tone.
Maintain ${brandVoice.formality} formality.
Emphasise ${adjectives}.
`;
}

export function renderBusinessFocus(focus: any) {
  if (!focus) return "";

  return `
Business focus:
Primary goal is ${focus.primary_goal}.
Preferred call to action is "${focus.preferred_cta}".
`;
}

export function renderGuardrails(guardrails: any) {
  if (!guardrails) return "";

  const avoid = guardrails.avoid_phrases?.join(", ") || "";
  const restricted = guardrails.restricted_topics?.join(", ") || "";

  return `
Conversation guardrails:
Avoid these phrases: ${avoid}.
Do not discuss: ${restricted}.
`;
}
