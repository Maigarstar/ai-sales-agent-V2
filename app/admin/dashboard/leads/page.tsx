"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Filter } from "lucide-react";

type Lead = {
  id: string;
  client_name: string | null;
  email: string | null;
  wedding_date: string | null;
  investment: string | null;
  status: string | null;
};

export default function QualifiedLeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("vendor_leads")
        .select("id, client_name, email, wedding_date, investment, status")
        .order("created_at", { ascending: false });
      if (!error && data) setLeads(data);
    };
    fetchLeads();
  }, [supabase]);

  return (
    <div style={pageWrapper}>
      {/* HEADER */}
      <header style={header}>
        <div>
          <h1 style={title}>
            Qualified <span style={highlight}>Leads</span>
          </h1>
          <p style={subtitle}>
            High-value intercepts qualified by Aura Intelligence.
          </p>
        </div>
        <button style={exportBtn}>
          <Download size={16} />
          <span>Export Manifest</span>
        </button>
      </header>

      {/* SEARCH + FILTERS */}
      <div style={filterBar}>
        <input
          type="text"
          placeholder="Search intercepts..."
          style={searchInput}
        />
        <button style={filterBtn}>
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* TABLE HEADERS */}
      <div style={tableHeader}>
        <div style={colProspect}>Prospect</div>
        <div style={col}>Wedding Date</div>
        <div style={col}>Investment</div>
        <div style={col}>Status</div>
        <div style={colIntel}>Intel</div>
      </div>

      {/* LEADS */}
      {leads.map((lead) => (
        <div key={lead.id} style={leadRow}>
          <div style={colProspect}>
            <div style={prospectName}>{lead.client_name || "Unnamed"}</div>
            <div style={prospectEmail}>{lead.email}</div>
          </div>
          <div style={col}>
            {lead.wedding_date
              ? new Date(lead.wedding_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "TBC"}
          </div>
          <div style={col}>
            {lead.investment ? `£${lead.investment}` : "—"}
          </div>
          <div style={col}>
            <span style={statusBadge}>{lead.status || "Qualified"}</span>
          </div>
          <div style={colIntel}>
            <span style={intelDots}>•••</span>
          </div>
        </div>
      ))}

      {/* FOOTER BRANDING */}
      <footer style={footer}>
        <div style={mainBrand}>5 Star Weddings</div>
        <div style={powerBrand}>Powered by Taigenic AI Concierge</div>
      </footer>
    </div>
  );
}

/* === BRAND DESIGN SYSTEM === */

const pageWrapper = {
  backgroundColor: "#FAF7F6", // Cream base
  minHeight: "100vh",
  padding: "60px 80px",
  fontFamily: "'Nunito Sans', sans-serif",
  color: "#2E2B28",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "46px",
  fontWeight: 400,
  color: "#2E2B28",
};

const highlight = {
  color: "#C5A059", // muted gold accent
};

const subtitle = {
  color: "#7A7672",
  fontSize: "16px",
  marginTop: "10px",
};

const exportBtn = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "transparent",
  border: "1px solid #C5A059",
  color: "#2E2B28",
  fontSize: "14px",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  letterSpacing: "0.5px",
};

const filterBar = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "30px",
};

const searchInput = {
  flex: 1,
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "15px",
  outline: "none",
  color: "#2E2B28",
  boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
};

const filterBtn = {
  backgroundColor: "#FFFFFF",
  color: "#2E2B28",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: "10px",
  padding: "10px 18px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
  color: "#7A7672",
  fontWeight: 700,
  fontSize: "12px",
  letterSpacing: "1px",
  marginBottom: "14px",
  textTransform: "uppercase" as const,
  padding: "0 12px",
};

const leadRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
  backgroundColor: "#FFFFFF",
  borderRadius: "14px",
  padding: "20px 16px",
  alignItems: "center",
  marginBottom: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const col = { fontSize: "15px", color: "#2E2B28" };
const colProspect = { ...col, fontWeight: 600 };
const colIntel = { textAlign: "center" as const };

const prospectName = { fontWeight: 700, color: "#2E2B28", marginBottom: "4px" };
const prospectEmail = { fontSize: "13px", color: "#C5A059" };

const statusBadge = {
  backgroundColor: "#F4EBDC",
  color: "#2E2B28",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const intelDots = {
  fontSize: "22px",
  letterSpacing: "2px",
  color: "#7A7672",
};

const footer = {
  marginTop: "60px",
  textAlign: "center" as const,
};

const mainBrand = {
  fontSize: "14px",
  letterSpacing: "3px",
  color: "#2E2B28",
  fontWeight: 700,
  marginBottom: "4px",
};

const powerBrand = {
  fontSize: "11px",
  letterSpacing: "1.5px",
  color: "#7A7672",
  opacity: 0.7,
};
