// app/browse/page.tsx
"use client";

import React from "react";
import Link from "next/link";

type VenueCard = {
  name: string;
  location: string;
  note: string;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 22,
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        border: "1px solid rgba(24,63,52,0.08)",
        padding: 18,
      }}
    >
      {children}
    </section>
  );
}

export default function BrowsePage() {
  const featured: VenueCard[] = [
    { name: "Featured venue one", location: "Italy", note: "Luxury wedding weekends, iconic spaces, high-end service." },
    { name: "Featured venue two", location: "France", note: "Statement interiors, refined terraces, destination ready." },
    { name: "Featured venue three", location: "Greece", note: "Sea views, sunset ceremonies, effortless celebration flow." },
    { name: "Featured venue four", location: "UK", note: "City glamour, heritage rooms, polished hosting." },
    { name: "Featured venue five", location: "Spain", note: "Warm light, generous spaces, modern romance." },
    { name: "Featured venue six", location: "Portugal", note: "Architectural beauty, vineyard moments, slow luxury." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 32,
          fontFamily: '"Nunito Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Gilda Display","Playfair Display",serif',
                fontSize: 34,
                fontWeight: 400,
                letterSpacing: -0.4,
                color: "#183F34",
              }}
            >
              Browse venues
            </h1>
            <p style={{ marginTop: 8, color: "#666", maxWidth: 820 }}>
              A curated preview. Shortlist a few, then use concierge chat to narrow the perfect match.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={ghostBtn}>
              Back to concierge
            </Link>
            <Link href="/chat" style={primaryBtn}>
              Start concierge chat
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {featured.map((v) => (
            <Card key={v.name}>
              <div style={{ fontWeight: 900, color: "#111" }}>{v.name}</div>
              <div style={{ marginTop: 6, color: "#183F34", fontWeight: 800, fontSize: 13 }}>{v.location}</div>
              <div style={{ marginTop: 10, color: "#666", fontSize: 13, lineHeight: 1.6 }}>{v.note}</div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" style={outlineBtn}>
                  Shortlist
                </button>
                <Link href="/chat" style={ghostBtn}>
                  Ask concierge
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            borderRadius: 22,
            background: "#ffffff",
            border: "1px solid rgba(24,63,52,0.08)",
            padding: 18,
          }}
        >
          <div style={{ fontWeight: 900, color: "#111" }}>Next step</div>
          <div style={{ marginTop: 8, color: "#666", lineHeight: 1.6, fontSize: 14 }}>
            Tell concierge your date, guest count, style, and budget. You will get a tighter shortlist and a clear path to enquiries.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/chat" style={primaryBtn}>
              Start concierge chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: "12px 16px",
  borderRadius: 14,
  background: "#183F34",
  border: "1px solid #183F34",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "800",
  display: "inline-block",
};

const ghostBtn = {
  padding: "12px 16px",
  borderRadius: 14,
  background: "rgba(24,63,52,0.06)",
  border: "1px solid rgba(24,63,52,0.12)",
  color: "#183F34",
  textDecoration: "none",
  fontWeight: "800",
  display: "inline-block",
};

const outlineBtn = {
  padding: "12px 16px",
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid rgba(24,63,52,0.18)",
  color: "#183F34",
  fontWeight: 900,
  cursor: "pointer",
};
