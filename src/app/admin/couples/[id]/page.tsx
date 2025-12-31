"use client";

import { useParams, useRouter } from "next/navigation";
import { Heart, Mail, Calendar, ArrowLeft, MessageSquare } from "lucide-react";

export default function AdminCoupleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // DEMO DATA
  const couple = {
    id,
    names: "Amara & James",
    email: "amara.james@email.com",
    wedding_date: "2026-06-14",
    status: "Active",
    joined: "2025-01-02",
  };

  return (
    <div style={page}>
      <button onClick={() => router.back()} style={backBtn}>
        <ArrowLeft size={14} /> Back to couples
      </button>

      <div style={card}>
        <div style={header}>
          <div style={avatar}>
            <Heart size={18} />
          </div>
          <div>
            <h1 style={title}>{couple.names}</h1>
            <p style={subtitle}>Wedding Couple</p>
          </div>
        </div>

        <div style={grid}>
          <Info label="Email" value={couple.email} icon={<Mail size={14} />} />
          <Info
            label="Wedding date"
            value={new Date(couple.wedding_date).toLocaleDateString("en-GB")}
            icon={<Calendar size={14} />}
          />
          <Info label="Status" value={couple.status} />
          <Info
            label="Joined"
            value={new Date(couple.joined).toLocaleDateString("en-GB")}
          />
        </div>

        <div style={section}>
          <h3 style={sectionTitle}>Activity</h3>
          <p style={empty}>
            Concierge conversations and enquiries will appear here.
          </p>
        </div>

        <div style={section}>
          <h3 style={sectionTitle}>Admin Notes</h3>
          <p style={empty}>No notes yet.</p>
        </div>

        <div style={section}>
          <h3 style={sectionTitle}>AI Conversations</h3>
          <p style={empty}>
            Linked AI chats will be shown here once enabled.
          </p>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Info({ label, value, icon }: any) {
  return (
    <div style={infoBox}>
      <span style={infoLabel}>{label}</span>
      <div style={infoValue}>
        {icon} {value}
      </div>
    </div>
  );
}

/* STYLES */

const page = {
  padding: "70px 100px",
  fontFamily: "'Nunito Sans', sans-serif",
};

const backBtn = {
  display: "flex",
  gap: 8,
  marginBottom: 30,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#666",
};

const card = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 20,
  padding: 44,
  maxWidth: 900,
};

const header = {
  display: "flex",
  gap: 20,
  marginBottom: 40,
};

const avatar = {
  width: 56,
  height: 56,
  borderRadius: 14,
  background: "rgba(200,164,75,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#C8A44B",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
};

const subtitle = {
  fontSize: 14,
  color: "#777",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 40,
};

const infoBox = {
  border: "1px solid #EEE",
  borderRadius: 14,
  padding: "18px 20px",
};

const infoLabel = {
  fontSize: 12,
  color: "#777",
  marginBottom: 6,
};

const infoValue = {
  fontSize: 14,
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const section = {
  marginBottom: 30,
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 12,
};

const empty = {
  fontSize: 13,
  color: "#999",
};
