import { createBrowserClient } from "@supabase/ssr";

export async function getLeadById(leadId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      created_at,
      status,
      score,
      source,
      name,
      email,
      phone,
      location,
      wedding_date,
      aesthetic,
      budget,
      atlas_summary,
      lead_context,
      raw_metadata
    `)
    .eq("id", leadId)
    .single();

  if (error) {
    console.error("getLeadById failed", error);
    throw new Error("Failed to load lead");
  }

  return data;
}
