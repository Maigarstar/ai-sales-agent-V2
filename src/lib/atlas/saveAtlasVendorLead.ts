import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type AtlasVendorLeadInput = {
  business_name?: string;
  category?: string;
  location?: string;
  target_market?: string;
  luxury_positioning?: boolean;
  annual_capacity?: number;
  years_experience?: number;
  growth_goal?: string;
  discovery_channel?: string;
  intent_timing?: string;
  contact_name?: string;
  contact_email?: string;
  website?: string;
  stage?: string;
  score?: number;
};

export async function saveAtlasVendorLead(
  data: AtlasVendorLeadInput
) {
  if (!data.contact_email) return null;

  const { data: result, error } = await supabase
    .from("vendor_leads")
    .upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "contact_email" }
    )
    .select()
    .single();

  if (error) {
    console.error("Atlas lead save failed", error);
    return null;
  }

  return result;
}
