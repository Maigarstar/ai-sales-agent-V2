import { createClient } from "@supabase/supabase-js";

export async function getDashboardData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // LEADS
  const { data: leads } = await supabase
    .from("vendor_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const totalLeads = leads?.length || 0;

  const hotLeads = leads?.filter(l => l.lead_type === "Hot").length || 0;
  const warmLeads = leads?.filter(l => l.lead_type === "Warm").length || 0;
  const coldLeads = leads?.filter(l => l.lead_type === "Cold").length || 0;

  const today = new Date().toISOString().split("T")[0];
  const leadsToday = leads?.filter(l => (l.created_at || "").startsWith(today)).length || 0;

  // VENDORS
  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  const totalVendors = vendors?.length || 0;

  const vendorsPending =
    vendors?.filter(v => v.status === "pending").length || 0;

  const vendorsApproved =
    vendors?.filter(v => v.status === "approved").length || 0;

  // AI AGENT LOGS
  const { data: logs } = await supabase
    .from("ai_agent_logs")
    .select("*")
    .order("created_at", { ascending: false });

  const totalInteractions = logs?.length || 0;

  const avgScore =
    logs && logs.length > 0
      ? logs.reduce((sum, row) => sum + (row.score || 0), 0) /
        logs.length
      : 0;

  // AI ACCURACY: how often we predicted “Hot” correctly
  const hotCorrect =
    logs?.filter(l => l.prediction === "Hot" && l.actual === "Hot").length || 0;
  const hotTotal =
    logs?.filter(l => l.prediction === "Hot").length || 0;

  const aiAccuracy = hotTotal > 0 ? Math.round((hotCorrect / hotTotal) * 100) : 0;

  return {
    leads: {
      total: totalLeads,
      hot: hotLeads,
      warm: warmLeads,
      cold: coldLeads,
      today: leadsToday,
      latest: leads?.slice(0, 10) || [],
    },
    vendors: {
      total: totalVendors,
      pending: vendorsPending,
      approved: vendorsApproved,
      latest: vendors?.slice(0, 10) || [],
    },
    ai: {
      interactions: totalInteractions,
      avgScore,
      accuracy: aiAccuracy,
      latest: logs?.slice(0, 10) || [],
    },
  };
}
