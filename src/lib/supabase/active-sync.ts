import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Dispatches a bespoke email and logs it to the DB
 */
export const dispatchBespokeEmail = async (leadId: string, emailData: any) => {
  const { data, error } = await supabase
    .from("lead_emails")
    .insert([{
      lead_id: leadId,
      ...emailData,
      status: 'sent'
    }]); //
  
  if (error) throw error;
  return data;
};

/**
 * Updates the Lead Status (e.g., from 'Neural' to 'Human')
 */
export const updateLeadStatus = async (leadId: string, status: string) => {
  return await supabase
    .from("vendor_leads")
    .update({ lead_status: status })
    .eq("id", leadId); //
};