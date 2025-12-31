"use client";

import { Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div style={page}>
      {/* BRAND */}
      <header style={header}>
        <div style={brand}>5 STAR WEDDINGS — CONCIERGE</div>
      </header>

      {/* HERO */}
      <main style={hero}>
        <div style={badge}>
          <Sparkles size={14} />
          Powered by Taigenic Intelligence
        </div>

        <h1 style={title}>
          The Future of{" "}
          <span style={{ color: "var(--aura-gold)" }}>Ultra-Luxury</span>{" "}
          Weddings
        </h1>

        <p style={subtitle}>
          An elite concierge platform qualifying, protecting and elevating
          the world’s most refined wedding experiences.
        </p>

        <div style={divider} />

        <p style={comingSoon}>
          Launching Soon
        </p>

        <p style={microCopy}>
          Private access is currently in preparation.
          Invitations will be extended to a select circle of
          industry leaders and discerning couples.
        </p>
      </main>

      {/* FOOTER */}
      <footer style={footer}>
        © 2025 5 Star Weddings Concierge · Powered by Taigenic AI
      </footer>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: "100vh",
  background: "#0A0C0B",
  color: "#E0E7E5",
  fontFamily: "'Nunito Sans', sans-serif",
  display: "flex",
  flexDirection: "column" as const,
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
};

const brand = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "16px",
  letterSpacing: "3px",
  color: "var(--aura-gold)",
};

const hero = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center" as const,
  padding: "0 20px",
  maxWidth: "760px",
  margin: "0 auto",
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "11px",
  letterSpacing: "2px",
  padding: "8px 14px",
  borderRadius: "6px",
  background: "rgba(197,160,89,0.12)",
  color: "var(--aura-gold)",
  marginBottom: "32px",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "clamp(38px, 7vw, 64px)",
  lineHeight: "1.15",
  marginBottom: "24px",
};

const subtitle = {
  fontSize: "17px",
  lineHeight: "1.7",
  color: "#94A39F",
  maxWidth: "620px",
  marginBottom: "40px",
};

const divider = {
  width: "80px",
  height: "1px",
  background: "rgba(197,160,89,0.4)",
  margin: "0 auto 32px",
};

const comingSoon = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "22px",
  letterSpacing: "3px",
  marginBottom: "16px",
};

const microCopy = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#6F7D79",
  maxWidth: "520px",
};

const footer = {
  padding: "32px 20px",
  fontSize: "11px",
  color: "#666",
  textAlign: "center" as const,
};
