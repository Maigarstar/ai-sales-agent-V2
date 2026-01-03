"use client";

import React, {
  useEffect,
  useState,
  type CSSProperties
} from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateLeadStatus } from "@/lib/leads/updateLeadStatus";

type VendorLead = {
  id: string;
  created_at: string;
  metadata: any;
  location: string | null;
  score: number;
  lead_type: string;
  lead_status: string;
  last_user_message?: string | null;
  last_assistant_message?: string | null;
};

function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<VendorLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadLead() {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`);
        const data = await res.json();
        if (data.ok) setLead(data.lead);
      } finally {
        setLoading(false);
      }
    }

    if (leadId) loadLead();
  }, [leadId]);

  if (loading) {
    return <div style={loadingState}>Loading lead…</div>;
  }

  if (!lead) {
    return <div style={loadingState}>Lead not found.</div>;
  }

  const meta = lead.metadata || {};

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <button style={backBtn} onClick={() => router.push("/admin/leads")}>
          <ArrowLeft size={16} /> Back to leads
        </button>

        <div>
          <h1 style={title}>
            {meta.couple_name || "Unnamed prospect"}
          </h1>
          <p style={subtitle}>
            {meta.email || "Email not captured"} ·{" "}
            {lead.location || "Location TBC"}
          </p>
        </div>
      </div>

      {/* GRID */}
      <div style={grid}>
        {/* LEFT */}
        <div>
          <section style={card}>
            <h2 style={sectionTitle}>Atlas intelligence</h2>
            <p style={summaryText}>
              {lead.last_assistant_message ||
                "Atlas analysis pending. This lead has been qualified by Aura."}
            </p>
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Conversation snapshot</h2>

            {lead.last_user_message && (
              <div style={chatUser}>
                <strong>Couple</strong>
                <p>{lead.last_user_message}</p>
              </div>
            )}

            {lead.last_assistant_message && (
              <div style={chatAtlas}>
                <strong>Atlas</strong>
                <p>{lead.last_assistant_message}</p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div>
          <section style={card}>
            <h2 style={sectionTitle}>Wedding details</h2>
            <Detail label="Wedding date" value={meta.wedding_date} />
            <Detail label="Investment" value={meta.budget} />
            <Detail label="Aesthetic" value={meta.aesthetic} />
            <Detail label="Status" value={lead.lead_status.toUpperCase()} />
            <Detail label="Score" value={`${lead.score}/100`} />
          </section>

          <section style={card}>
            <h2 style={sectionTitle}>Actions</h2>

            <button style={primaryBtn}>Contact couple</button>

            <button
              style={secondaryBtn}
              disabled={updating || lead.lead_status === "contacted"}
              onClick={async () => {
                setUpdating(true);
                await updateLeadStatus(lead.id, "contacted");
                setLead({ ...lead, lead_status: "contacted" });
                setUpdating(false);
              }}
            >
              Mark as contacted
            </button>

            <button
              style={ghostBtn}
              disabled={updating || lead.lead_status === "archived"}
              onClick={async () => {
                setUpdating(true);
                await updateLeadStatus(lead.id, "archived");
                setLead({ ...lead, lead_status: "archived" });
                setUpdating(false);
              }}
            >
              Archive lead
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENT ===== */

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div style={detailRow}>
      <span style={detailLabel}>{label}</span>
      <span style={detailValue}>{value || "Not specified"}</span>
    </div>
  );
}

/* ===== STYLES ===== */

const container: CSSProperties = {
  backgroundColor: "#F7F7F5",
  minHeight: "100vh",
  padding: "40px",
  color: "#1F2933"
};

const loadingState: CSSProperties = {
  padding: "80px",
  textAlign: "center",
  color: "#6B7280"
};

const header: CSSProperties = {
  marginBottom: "40px"
};

const backBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  color: "#6B7280",
  cursor: "pointer",
  marginBottom: "16px",
  fontSize: "13px"
};

const title: CSSProperties = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "32px",
  margin: 0
};

const subtitle: CSSProperties = {
  fontSize: "13px",
  color: "#6B7280",
  marginTop: "6px"
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "32px"
};

const card: CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px"
};

const sectionTitle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const summaryText: CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6
};

const chatUser: CSSProperties = {
  backgroundColor: "#F9FAFB",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px"
};

const chatAtlas: CSSProperties = {
  backgroundColor: "rgba(197,160,89,0.08)",
  padding: "12px",
  borderRadius: "8px"
};

const detailRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "13px"
};

const detailLabel: CSSProperties = {
  color: "#6B7280"
};

const detailValue: CSSProperties = {
  fontWeight: 600
};

const primaryBtn: CSSProperties = {
  width: "100%",
  backgroundColor: "#C5A059",
  color: "#FFFFFF",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: "10px"
};

const secondaryBtn: CSSProperties = {
  width: "100%",
  backgroundColor: "#FFFFFF",
  color: "#1F2933",
  border: "1px solid #E5E7EB",
  padding: "12px",
  borderRadius: "8px",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: "10px"
};

const ghostBtn: CSSProperties = {
  width: "100%",
  backgroundColor: "transparent",
  color: "#6B7280",
  border: "none",
  padding: "10px",
  cursor: "pointer"
};

export default LeadDetailPage;
export {};
