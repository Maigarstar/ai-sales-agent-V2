import { CORE_RULES } from "./coreRules";
import { AURA_PROMPT } from "./auraPrompt";
import { ATLAS_PROMPT } from "./atlasPrompt";
import {
  renderBrandVoice,
  renderBusinessFocus,
  renderGuardrails
} from "./renderModules";

import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

type AgentType = "aura" | "atlas";

export async function assemblePrompt(
  agent: AgentType,
  organisationId: string | null,
  context: string
) {
  const rolePrompt = agent === "aura" ? AURA_PROMPT : ATLAS_PROMPT;

  let modulesText = "";

  if (organisationId) {
    const { data: profile } = await supabaseAdmin()
      .from("organisation_ai_profiles")
      .select("*")
      .eq("organisation_id", organisationId)
      .single();

    if (profile) {
      modulesText += renderBrandVoice(profile.brand_voice);
      modulesText += renderBusinessFocus(profile.business_focus);
      modulesText += renderGuardrails(profile.guardrails);
    }
  }

  const finalPrompt = `
${CORE_RULES}

${rolePrompt}

${modulesText}

Context:
${context}
`;

  return finalPrompt.trim();
}
