"use client";

import React from "react";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";

/**
 * 5 STAR WEDDINGS — LEADS COMMAND
 * This page provides the 'page.tsx' entry point to resolve the 404.
 */
export default function LeadsPage() {
  return (
    <div style={container}>
      {/* 1. HEADER SECTION */}
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>QUALIFIED <span style={{ color: "#C5A059" }}>LEADS</span></h1>
          <p style={subtitleStyle}>High-value intercepts qualified by Aura Intelligence.</p>
        </div>
        <button style={exportBtn}>
          <Download size={14} /> EXPORT MANIFEST
        </button>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={16} color="#94A39F" />
          <input type="text" placeholder="Search intercepts..." style={searchInput} />
        </div>
        <button style={filterBtn}>
          <Filter size={14} /> FILTERS
        </button>
      </div>

      {/* 3. INTELLIGENCE TABLE */}
      <div style={tableWrapper}>
        <div style={tableHeader}>
          <div>PROSPECT</div>
          <div>WEDDING DATE</div>
          <div>INVESTMENT</div>
          <div>STATUS</div>
          <div style={{ textAlign: "right" }}>INTEL</div>
        </div>

        {/* Lead Row Example 1 */}
        <LeadRow 
          name="Sophia & Alexander" 
          email="sophia.v@elite.com"
          date="12 SEP 2026"
          budget="£85,000"
          status="QUALIFIED"
        />

        {/* Lead Row Example 2 */}
        <LeadRow 
          name="Marcus Wright" 
          email="m.wright@global.net"
          date="04 JUL 2026"
          budget="£120,000"
          status="CONCIERGE"
        />
      </div>
    </div>
  );
}

/* === ROW COMPONENT === */

function LeadRow({ name, email, date, budget, status }: any) {
  return (
    <div style={rowStyle}>
      <div>
        <div style={nameText}>{name}</div>
        <div style={emailText}>{email}</div>
      </div>
      <div style={dataText}>{date}</div>
      <div style={budgetText}>{budget}</div>
      <div>
        <span style={statusBadge}>{status}</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <button style={actionBtn}><MoreHorizontal size={18} /></button>
      </div>
    </div>
  );
}

/* === LUXURY STYLES === */

const container = { color: "#E0E7E5" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" };
const titleStyle = { fontFamily: "'Gilda Display', serif", fontSize: "32px", letterSpacing: "2px", margin: 0 };
const subtitleStyle = { fontSize: "12px", color: "#94A39F", marginTop: "8px", letterSpacing: "1px" };

const exportBtn = { backgroundColor: "transparent", border: "1px solid #C5A059", color: "#C5A059", padding: "10px 20px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px" };

const filterBar = { display: "flex", gap: "15px", marginBottom: "25px" };
const searchWrapper = { flex: 1, display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#141615", padding: "10px 16px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" };
const searchInput = { background: "none", border: "none", color: "#fff", outline: "none", fontSize: "13px", width: "100%" };
const filterBtn = { backgroundColor: "#141615", border: "1px solid rgba(255,255,255,0.05)", color: "#94A39F", padding: "0 16px", borderRadius: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" };

const tableWrapper = { backgroundColor: "#141615", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" };
const tableHeader = { display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 80px", padding: "16px 24px", fontSize: "10px", fontWeight: 700, color: "#94A39F", letterSpacing: "2px", borderBottom: "1px solid rgba(255,255,255,0.05)" };
const rowStyle = { display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 80px", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.02)", alignItems: "center" };

const nameText = { fontSize: "14px", fontWeight: 600, color: "#E0E7E5" };
const emailText = { fontSize: "12px", color: "#C5A059", marginTop: "2px" };
const dataText = { fontSize: "13px", color: "#94A39F" };
const budgetText = { fontSize: "14px", fontWeight: 700, color: "#E0E7E5" };
const statusBadge = { fontSize: "10px", padding: "4px 10px", backgroundColor: "rgba(197, 160, 89, 0.1)", color: "#C5A059", borderRadius: "4px", fontWeight: 700 };
const actionBtn = { background: "none", border: "none", color: "#94A39F", cursor: "pointer" };