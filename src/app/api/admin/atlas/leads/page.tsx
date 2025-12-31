import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Lead = {
  id: string;
  business_name: string;
  category: string;
  location: string;
  priority: "HOT" | "WARM" | "COLD";
  score: number;
  stage: string;
  updated_at: string;
};

export default async function AtlasLeadsPage() {
  const { data: leads, error } = await supabase
    .from("vendor_leads")
    .select(
      "id, business_name, category, location, priority, score, stage, updated_at"
    )
    .order("priority", { ascending: false })
    .order("score", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Atlas Leads</h1>
        <p>Unable to load leads.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Atlas Leads</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e5e5" }}>
            <th style={{ padding: "8px 6px" }}>Business</th>
            <th style={{ padding: "8px 6px" }}>Category</th>
            <th style={{ padding: "8px 6px" }}>Location</th>
            <th style={{ padding: "8px 6px" }}>Priority</th>
            <th style={{ padding: "8px 6px" }}>Score</th>
            <th style={{ padding: "8px 6px" }}>Stage</th>
            <th style={{ padding: "8px 6px" }}>Updated</th>
          </tr>
        </thead>

        <tbody>
          {leads?.map((lead: Lead) => (
            <tr
              key={lead.id}
              style={{
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <td style={{ padding: "8px 6px", fontWeight: 500 }}>
                {lead.business_name}
              </td>
              <td style={{ padding: "8px 6px" }}>{lead.category}</td>
              <td style={{ padding: "8px 6px" }}>{lead.location}</td>
              <td style={{ padding: "8px 6px" }}>
                <PriorityBadge value={lead.priority} />
              </td>
              <td style={{ padding: "8px 6px" }}>{lead.score}</td>
              <td style={{ padding: "8px 6px" }}>{lead.stage}</td>
              <td style={{ padding: "8px 6px" }}>
                {new Date(lead.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriorityBadge({ value }: { value: "HOT" | "WARM" | "COLD" }) {
  const colors = {
    HOT: "#C0392B",
    WARM: "#D4A017",
    COLD: "#7F8C8D",
  };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        color: "#fff",
        background: colors[value],
      }}
    >
      {value}
    </span>
  );
}
