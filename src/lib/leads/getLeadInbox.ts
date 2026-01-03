import { createBrowserClient } from "@supabase/ssr";

type LeadInboxFilters = {
  status?: "new" | "contacted" | "archived";
  limit?: number;
  offset?: number;
};

export async function getLeadInbox(
  organisationId: string,
  filters: LeadInboxFilters = {}
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    status,
    limit = 20,
    offset = 0
  } = filters;

  let query = supabase
    .from("leads")
    .select(`
      id,
      created_at,
      status,
      score,
      source,
      name,
      email,
      location,
      wedding_date,
      aesthetic,
      budget,
      atlas_summary
    `)
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getLeadInbox failed", error);
    throw new Error("Failed to fetch leads");
  }

  return data;
}
