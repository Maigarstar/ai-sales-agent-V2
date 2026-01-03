"use client";

import React, { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";


type VendorLead = {
  id: string;
  created_at: string;
  metadata: any;
  location: string | null;
  score: number;
  lead_type: string;
  lead_status: string;
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();

      if (data.ok) {
        setLeads(data.leads);
      }

      setLoading(false);
    }

    loadLeads();
  }, []);

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>
            QUALIFIED <span style={{ color: "#C5A059" }}>LEADS</span>
          </h1>
          <p style={subtitleStyle}>
            High value intercepts qualified by Aura Intelligence.
          </p>
        </div>

        <button style={exportBtn}>
          <Download size={14} /> EXPORT MANIFEST
        </button>
      </div>

      {/* SEARCH */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={16} color="#6B7280" />
          <input
            type="text"
            placeholder="Search intercepts..."
            style={searchInput}
          />
        </div>
        <button style={filterBtn}>
          <Filter size={14} /> FILTERS
        </button>
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        <div style={tableHeader}>
          <div>PROSPECT</div>
          <div>WEDDING DATE</div>
          <div>INVESTMENT</div>
          <div>STATUS</div>
          <div style={{ textAlign: "right" }}>INTEL</div>
        </div>

        {loading && (
          <div style={emptyState}>Loading leads…</div>
        )}

        {!loading && leads.length === 0 && (
          <div style={emptyState}>No leads captured yet.</div>
        )}

        {!loading &&
          leads.map((lead) => {
            const meta = lead.metadata || {};

            return (
              <div
                key={lead.id}
                style={rowStyle}
                onClick={() => router.push(`/admin/leads/${lead.id}`)}
              >
                <div>
                  <div style={nameText}>
                    {meta.couple_name || "Unnamed prospect"}
                  </div>
                  <div style={emailText}>
                    {meta.email || "Email not captured"}
                  </div>
                </div>

                <div style={dataText}>
                  {meta.wedding_date || "TBC"}
                </div>

                <div style={budgetText}>
                  {meta.budget || "—"}
                </div>

                <div>
                  <span style={statusBadge}>
                    {lead.lead_status.toUpperCase()}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button style={actionBtn}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* === LIGHT LUXURY STYLES === */

const container: CSSProperties = {
  backgroundColor: "#F7F7F5",
  minHeight: "100vh",
  padding: "40px",
  color: "#1F2933"
};

const headerRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "40px"
};

const titleStyle: CSSProperties = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "32px",
  letterSpacing: "2px",
  margin: 0
};

const subtitleStyle: CSSProperties = {
  fontSize: "13px",
  color: "#6B7280",
  marginTop: "8px"
};

const exportBtn: CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #C5A059",
  color: "#C5A059",
  padding: "10px 20px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const filterBar: CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px"
};

const searchWrapper: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "#FFFFFF",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #E5E7EB"
};

const searchInput: CSSProperties = {
  background: "none",
  border: "none",
  outline: "none",
  fontSize: "14px",
  width: "100%",
  color: "#111827"
};

const filterBtn: CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  color: "#6B7280",
  padding: "0 16px",
  borderRadius: "8px",
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer"
};

const tableWrapper: CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E5E7EB",
  overflow: "hidden"
};

const tableHeader: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 80px",
  padding: "16px 24px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#6B7280",
  borderBottom: "1px solid #E5E7EB"
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 80px",
  padding: "20px 24px",
  borderBottom: "1px solid #F1F5F9",
  alignItems: "center",
  cursor: "pointer"
};

const nameText: CSSProperties = {
  fontSize: "15px",
  fontWeight: 600
};

const emailText: CSSProperties = {
  fontSize: "12px",
  color: "#C5A059",
  marginTop: "4px"
};

const dataText: CSSProperties = {
  fontSize: "13px",
  color: "#6B7280"
};

const budgetText: CSSProperties = {
  fontSize: "15px",
  fontWeight: 700
};

const statusBadge: CSSProperties = {
  fontSize: "11px",
  padding: "4px 12px",
  backgroundColor: "rgba(197,160,89,0.12)",
  color: "#C5A059",
  borderRadius: "999px",
  fontWeight: 700
};

const actionBtn: CSSProperties = {
  background: "none",
  border: "none",
  color: "#6B7280",
  cursor: "pointer"
};

const emptyState: CSSProperties = {
  padding: "32px",
  textAlign: "center",
  color: "#6B7280",
  fontSize: "13px"
};
