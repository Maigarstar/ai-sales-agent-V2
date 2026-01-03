import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { buildLeadContext } from "@/lib/ai/buildLeadContext";
import { generateAtlasLeadSummary } from "@/lib/ai/generateAtlasLeadSummary";

export async function createLead({
  organisationId,
  couple,
  answers,
  availability,
  business
}: {
  organisationId: string;
  couple: any;
  answers: any;
  availability?: any;
  business: any;
}) {
  const leadContext = buildLeadContext({
    couple,
    answers,
    availability,
    business
  });

  const atlasSummary = await generateAtlasLeadSummary({
    organisationId,
    couple,
    answers,
    availability,
    business
  });

  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      organisation_id: organisationId,
      vendor_id: business.id,
      agent_id: "atlas",

      name: couple.name,
      email: couple.email,
      phone: couple.phone ?? null,

      source: "aura",
      status: "new",
      lead_type: "verified",

      wedding_date: couple.wedding_date || couple.wedding_date_range || null,
      location: couple.location ?? null,
      aesthetic: answers.aesthetic ?? null,
      budget: answers.budget ?? null,

      atlas_summary: atlasSummary,
      lead_context: leadContext,

      raw_metadata: {
        couple,
        answers,
        availability,
        business,
        atlas_version: "v1",
        created_via: "aura"
      },

      score: 100
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
