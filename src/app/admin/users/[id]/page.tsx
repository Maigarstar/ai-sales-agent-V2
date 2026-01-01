"use client";

import type React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

type Tab = "overview" | "notes" | "audit" | "conversations";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  /* ================= DEMO BUSINESS ================= */

  const [user] = useState({
    id,
    business_name: "The Ritz London",
    contact_name: "Events Director",
    email: "events@theritzlondon.com",
    phone: "+44 20 7493 8181",
    category: "Luxury Wedding Venue",
    user_type: "Business Account",
    luxury_tier: "Platinum",
    status: "Active",
    onboarding_completed: false,
    created_at: "2025-01-01",
  });

  /* ================= UI STATE ================= */

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [notes, setNotes] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (activeTab === "notes") loadNotes();
    if (activeTab === "audit") loadAudit();
  }, [activeTab]);

  async function loadNotes() {
    const { data } = await supabase
      .from("admin_notes")
      .select("*")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false });

    setNotes(data || []);
  }

  async function loadAudit() {
    const { data } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .eq("target_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setAudit(data || []);
  }

  async function addNote() {
    if (!noteInput.trim()) return;

    await supabase.from("admin_notes").insert({
      business_id: user.id,
      note: noteInput,
      admin_email: "admin@5starweddings.com",
    });

    setNoteInput("");
    loadNotes();
  }

  return (
    <div style={page}>
      <button onClick={() => router.push("/admin/business")} style={backBtn}>
        <ArrowLeft size={14} /> Back to business users
      </button>

      <div style={card}>
        <div style={headerRow}>
          <div style={iconWrap}>
            <Building2 />
          </div>
          <div>
            <h1 style={title}>{user.business_name}</h1>
            <p style={subtitle}>
              {user.category} • {user.user_type}
            </p>
          </div>
        </div>

        <div style={metaRow}>
          <Meta label="Tier" value={user.luxury_tier} style={tierPlatinum} />
          <Meta label="Status" value={user.status} style={statusActive} />
          <Meta
            label="Onboarding"
            value={user.onboarding_completed ? "Complete" : "Pending"}
            style={user.onboarding_completed ? statusActive : statusPending}
          />
        </div>

        <div style={tabs}>
          <TabItem label="Overview" icon={<User size={14} />} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabItem label="Notes" icon={<ClipboardList size={14} />} active={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
          <TabItem label="Audit" icon={<ShieldCheck size={14} />} active={activeTab === "audit"} onClick={() => setActiveTab("audit")} />
          <TabItem label="Conversations" icon={<MessageSquare size={14} />} active={activeTab === "conversations"} onClick={() => setActiveTab("conversations")} />
        </div>

        <div style={tabContent}>
          {activeTab === "overview" && (
            <>
              <Row icon={<User size={14} />} text={user.contact_name} />
              <Row icon={<Mail size={14} />} text={user.email} />
              <Row icon={<Phone size={14} />} text={user.phone} />
            </>
          )}

          {activeTab === "notes" && (
            <>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                style={noteTextarea}
              />
              <button onClick={addNote} style={primaryBtn}>Add note</button>
              {notes.map((n) => (
                <div key={n.id} style={noteItem}>
                  <p>{n.note}</p>
                  <div style={noteMeta}>{n.admin_email}</div>
                </div>
              ))}
            </>
          )}

          {activeTab === "audit" && (
            <>
              {audit.map((a) => (
                <div key={a.id} style={noteItem}>
                  <strong>{a.action}</strong>
                  <div style={noteMeta}>{a.admin_email}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={footer}>
          Joined {new Date(user.created_at).toLocaleDateString("en-GB")}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function TabItem({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{ ...tabBtn, ...(active ? tabActive : {}) }}>
      {icon} {label}
    </button>
  );
}

function Meta({ label, value, style }: any) {
  return (
    <div style={metaBox}>
      <span style={metaLabel}>{label}</span>
      <span style={style}>{value}</span>
    </div>
  );
}

function Row({ icon, text }: any) {
  return <div style={contactRow}>{icon} {text}</div>;
}

/* ================= STYLES ================= */

const page: React.CSSProperties = { padding: "70px 100px" };
const backBtn: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 30, background: "none", border: "none", cursor: "pointer" };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20, padding: 44, maxWidth: 960 };
const headerRow: React.CSSProperties = { display: "flex", gap: 20, marginBottom: 30 };
const iconWrap: React.CSSProperties = { width: 56, height: 56, borderRadius: 14, background: "#F4F4F4", display: "flex", alignItems: "center", justifyContent: "center" };
const title: React.CSSProperties = { fontSize: 32 };
const subtitle: React.CSSProperties = { fontSize: 14, color: "#777" };

const metaRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 40 };
const metaBox: React.CSSProperties = { border: "1px solid #EEE", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 };
const metaLabel: React.CSSProperties = { fontSize: 12, color: "#777", fontWeight: 600 };

const badgeBase: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const statusActive: React.CSSProperties = { ...badgeBase, background: "rgba(24,63,52,0.12)", color: "#183F34" };
const statusPending: React.CSSProperties = { ...badgeBase, background: "rgba(0,0,0,0.06)", color: "#666" };
const tierPlatinum: React.CSSProperties = { ...badgeBase, background: "#E6C87A", color: "#1A1A1A" };

const tabs: React.CSSProperties = { display: "flex", gap: 12, borderBottom: "1px solid #EEE", marginBottom: 30 };
const tabBtn: React.CSSProperties = { display: "flex", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13 };
const tabActive: React.CSSProperties = { borderBottom: "2px solid #183F34", fontWeight: 700 };

const tabContent: React.CSSProperties = { paddingTop: 10 };
const contactRow: React.CSSProperties = { display: "flex", gap: 10, marginBottom: 10 };

const noteTextarea: React.CSSProperties = { width: "100%", minHeight: 90, borderRadius: 12, border: "1px solid #DDD", padding: 14 };
const noteItem: React.CSSProperties = { borderBottom: "1px solid #EEE", padding: "14px 0", fontSize: 13 };
const noteMeta: React.CSSProperties = { fontSize: 11, color: "#999" };

const primaryBtn: React.CSSProperties = { marginTop: 10, padding: "10px 16px", borderRadius: 12, border: "none", background: "#183F34", color: "#fff", cursor: "pointer" };
const footer: React.CSSProperties = { marginTop: 30, paddingTop: 20, borderTop: "1px solid #EEE", fontSize: 12, color: "#999" };
