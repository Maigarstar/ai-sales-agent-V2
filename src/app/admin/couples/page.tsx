"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, Mail, Calendar } from "lucide-react";

type Couple = {
  id: string;
  names: string;
  email: string;
  wedding_date?: string;
  status: "Active" | "Planning" | "Dormant";
};

export default function AdminCouplesPage() {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEMO DATA ONLY
    setTimeout(() => {
      setCouples([
        {
          id: "couple-1",
          names: "Ava & James",
          email: "ava.james@email.com",
          wedding_date: "2026-06-12",
          status: "Planning",
        },
        {
          id: "couple-2",
          names: "Sophia & Luca",
          email: "sophia.luca@email.com",
          status: "Active",
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div style={page}>
      <h1 style={title}>Couples</h1>

      <p style={subtitle}>
        Couples planning weddings and engaging with the Concierge experience.
      </p>

      {loading ? (
        <p style={empty}>Loading couples…</p>
      ) : couples.length === 0 ? (
        <p style={empty}>No couples found.</p>
      ) : (
        <div style={card}>
          {couples.map((couple) => (
            <div key={couple.id} style={row}>
              <div style={avatar}>
                <HeartHandshake size={16} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={name}>{couple.names}</div>

                <div style={meta}>
                  <Mail size={12} /> {couple.email}
                </div>

                {couple.wedding_date && (
                  <div style={meta}>
                    <Calendar size={12} />{" "}
                    {new Date(couple.wedding_date).toLocaleDateString("en-GB")}
                  </div>
                )}
              </div>

              <span style={statusTag(couple.status)}>
                {couple.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: "70px 100px",
  fontFamily: "'Nunito Sans', sans-serif",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
  marginBottom: 6,
};

const subtitle = {
  fontSize: 14,
  color: "#666",
  marginBottom: 30,
};

const empty = {
  fontSize: 14,
  color: "#999",
};

const card = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  overflow: "hidden",
};

const row = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "18px 20px",
  borderBottom: "1px solid #F0F0F0",
};

const avatar = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "#F4F4F4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#C5A059",
};

const name = {
  fontWeight: 600,
  color: "#183F34",
};

const meta = {
  fontSize: 12,
  color: "#777",
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 2,
};

const statusTag = (status: string) => ({
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background:
    status === "Planning"
      ? "rgba(197,160,89,0.15)"
      : status === "Active"
      ? "rgba(24,63,52,0.12)"
      : "rgba(0,0,0,0.06)",
  color:
    status === "Planning"
      ? "#C5A059"
      : status === "Active"
      ? "#183F34"
      : "#666",
});
