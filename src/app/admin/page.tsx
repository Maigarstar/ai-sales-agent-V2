"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

/* =====================
   Types
===================== */

type Palette = {
  bg: string;
  transparent: string;
  text: string;
  subtle: string;
  primary: string;
  accent: string;
  gold: string;
  border: string;
  shadow: string;
};

type ActionCardProps = {
  title: string;
  text: string;
  button: string;
  href: string;
  palette: Palette;
};

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  palette: Palette;
};

type FutureCardProps = {
  title: string;
  text: string;
  button: string;
  href: string;
  palette: Palette;
};

/* =====================
   Page
===================== */

export default function AdminPage() {
  const [palette, setPalette] = useState<Palette>(lightPalette);

  useEffect(() => {
    const theme =
      document.documentElement.getAttribute("data-theme") || "light";
    setPalette(theme === "dark" ? darkPalette : lightPalette);
  }, []);

  return (
    <div style={{ ...pageWrapper, color: palette.text }}>
      <header style={header}>
        <h1 style={{ ...title, color: palette.text }}>
          Concierge Workspace
        </h1>
        <p style={{ ...subtitle, color: palette.subtle }}>
          Manage your AI concierge ecosystem. Review vendor leads, monitor planner
          activity, and oversee live conversations in real time.
        </p>
      </header>

      <div style={cardGrid}>
        <ActionCard
          title="Vendor leads"
          text="Review vendors flagged as promising, update their status, and guide them toward partnership."
          button="Open vendor leads"
          href="/admin/dashboard/vendor-leads"
          palette={palette}
        />

        <ActionCard
          title="Concierge conversations"
          text="Read full AI conversations with vendors and couples and extract qualified leads."
          button="View conversations"
          href="/admin/dashboard/vendors-chat"
          palette={palette}
        />

        <ActionCard
          title="Live chat takeover"
          text="Step into live conversations instantly when human nuance is required."
          button="Open live chat"
          href="/admin/dashboard/live"
          palette={palette}
        />
      </div>

      <section style={dashboardSection}>
        <h2 style={{ ...dashboardTitle, color: palette.text }}>
          Dashboard
        </h2>
        <p style={{ ...subtitle, color: palette.subtle }}>
          Your AI sales pipeline, lead performance, and vendor engagement at a glance.
        </p>

        <div style={statsGrid}>
          <StatCard label="New Leads Today" value="12" change="+18 percent" palette={palette} />
          <StatCard label="Hot Leads" value="4" change="+33 percent" palette={palette} />
          <StatCard label="Vendors Joined" value="3" change="Stable" palette={palette} />
          <StatCard label="AI Agent Accuracy" value="92 percent" change="+3 percent" palette={palette} />
        </div>

        <h3 style={{ ...futureTitle, color: palette.text }}>
          Coming Soon
        </h3>

        <div style={futureGrid}>
          <FutureCard
            title="AI Insights"
            text="Performance dashboards, predictive analysis, and system intelligence visualised."
            button="Open Insights"
            href="/admin/dashboard/insights"
            palette={palette}
          />

          <FutureCard
            title="Vendor Analytics"
            text="Track conversions, engagement, and lead quality across all active vendors."
            button="View Analytics"
            href="/admin/dashboard/analytics"
            palette={palette}
          />

          <FutureCard
            title="Planner Hub"
            text="A dedicated collaboration space for elite planners and partner vendors."
            button="Explore Hub"
            href="/admin/dashboard/planner-hub"
            palette={palette}
          />

          <FutureCard
            title="Bookings Engine"
            text="Centralised bookings, contracts, and payment automation."
            button="Access Engine"
            href="/admin/dashboard/bookings"
            palette={palette}
          />
        </div>
      </section>
    </div>
  );
}

/* =====================
   Components
===================== */

const ActionCard = ({ title, text, button, href, palette }: ActionCardProps) => (
  <div
    style={{
      ...card,
      backgroundColor: palette.transparent,
      borderColor: palette.gold,
      boxShadow: palette.shadow,
    }}
  >
    <div>
      <h3 style={{ ...cardTitle, color: palette.text }}>{title}</h3>
      <p style={{ ...cardText, color: palette.subtle }}>{text}</p>
    </div>
    <Link href={href}>
      <button style={{ ...cardButton, backgroundColor: palette.primary, color: "#fff" }}>
        {button}
      </button>
    </Link>
  </div>
);

const StatCard = ({ label, value, change, palette }: StatCardProps) => (
  <div
    style={{
      ...statCard,
      backgroundColor: palette.transparent,
      borderColor: palette.gold,
      boxShadow: palette.shadow,
    }}
  >
    <p style={{ ...statLabel, color: palette.subtle }}>{label}</p>
    <h3 style={{ ...statValue, color: palette.text }}>{value}</h3>
    <span style={{ ...statChange, color: "#22C55E" }}>{change}</span>
  </div>
);

const FutureCard = ({ title, text, button, href, palette }: FutureCardProps) => (
  <div
    style={{
      ...futureCard,
      backgroundColor: palette.transparent,
      borderColor: palette.gold,
      boxShadow: palette.shadow,
    }}
  >
    <div>
      <h3 style={{ ...cardTitle, color: palette.text }}>{title}</h3>
      <p style={{ ...cardText, color: palette.subtle }}>{text}</p>
    </div>
    <Link href={href}>
      <button style={{ ...cardButton, backgroundColor: palette.primary, color: "#fff" }}>
        {button}
      </button>
    </Link>
  </div>
);

/* =====================
   Palettes
===================== */

const lightPalette: Palette = {
  bg: "transparent",
  transparent: "rgba(255,255,255,0.85)",
  text: "#183F34",
  subtle: "#777",
  primary: "#183F34",
  accent: "#C5A059",
  gold: "#C5A059",
  border: "rgba(0,0,0,0.08)",
  shadow: "0 8px 24px rgba(197,160,89,0.08)",
};

const darkPalette: Palette = {
  bg: "transparent",
  transparent: "rgba(26,28,27,0.8)",
  text: "#E0E7E5",
  subtle: "#A5AAA9",
  primary: "#C5A059",
  accent: "#C5A059",
  gold: "#C5A059",
  border: "rgba(255,255,255,0.08)",
  shadow: "0 8px 24px rgba(197,160,89,0.15)",
};

/* =====================
   Styles - Type Casting Added
===================== */

const pageWrapper: React.CSSProperties = {
  minHeight: "100vh",
  fontFamily: "'Nunito Sans', sans-serif",
  padding: "60px 80px",
};

const header: React.CSSProperties = { marginBottom: "50px" };
const title: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "34px" };
const subtitle: React.CSSProperties = { fontSize: "15px", maxWidth: "600px", lineHeight: 1.6 };

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "60px",
};

const card: React.CSSProperties = {
  borderRadius: "16px",
  border: "1px solid",
  padding: "28px",
  backdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
};

const cardTitle: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "18px", marginBottom: "10px" };
const cardText: React.CSSProperties = { fontSize: "14px", marginBottom: "20px" };
const cardButton: React.CSSProperties = {
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
};

const dashboardSection: React.CSSProperties = { marginTop: "60px" };
const dashboardTitle: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "26px" };

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "30px",
  marginBottom: "60px",
};

const statCard: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid",
  padding: "24px",
  backdropFilter: "blur(10px)",
};

const statLabel: React.CSSProperties = { fontSize: "14px" };
const statValue: React.CSSProperties = { fontSize: "28px", fontWeight: 700, marginTop: "4px" };
const statChange: React.CSSProperties = { fontSize: "13px" };

const futureTitle: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "22px", marginBottom: "20px" };

const futureGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  marginTop: "20px",
  marginBottom: "60px",
};

const futureCard: React.CSSProperties = {
  borderRadius: "16px",
  border: "1px solid",
  padding: "26px",
  backdropFilter: "blur(10px)",
  height: "100%",
};