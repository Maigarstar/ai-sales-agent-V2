"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  CheckCircle2,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

type Tab = "overview" | "notes" | "audit" | "conversations";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  /* ================= DEMO BUSINESS ================= */

  const [user, setUser] = useState({
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

  /* ================= LOAD NOTES ================= */

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
      {/* BACK */}
      <button onClick={() => router.push("/admin/business")} style={backBtn}>
        <ArrowLeft size={14} /> Back to business users
      </button>

      <div style={card}>
        {/* HEADER */}
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

        {/* STATUS ROW */}
        <div style={metaRow}>
          <Meta label="Tier" value={user.luxury_tier} style={tierPlatinum} />
          <Meta label="Status" value={user.status} style={statusActive} />
          <Meta
            label="Onboarding"
            value={user.onboarding_completed ? "Complete" : "Pending"}
            style={user.onboarding_completed ? statusActive : statusPending}
          />
        </div>

        {/* TABS */}
        <div style={tabs}>
          <Tab label="Overview" icon={<User size={14} />} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <Tab label="Notes" icon={<ClipboardList size={14} />} active={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
          <Tab label="Audit" icon={<ShieldCheck size={14} />} active={activeTab === "audit"} onClick={() => setActiveTab("audit")} />
          <Tab label="Conversations" icon={<MessageSquare size={14} />} active={activeTab === "conversations"} onClick={() => setActiveTab("conversations")} />
        </div>

        {/* TAB CONTENT */}
        <div style={tabContent}>
          {activeTab === "overview" && (
            <>
              <h3 style={sectionTitle}>Primary Contact</h3>
              <Row icon={<User size={14} />} text={user.contact_name} />
              <Row icon={<Mail size={14} />} text={user.email} />
              <Row icon={<Phone size={14} />} text={user.phone} />
            </>
          )}

          {activeTab === "notes" && (
            <>
              <textarea
                placeholder="Add internal admin note"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                style={noteTextarea}
              />
              <button onClick={addNote} style={primaryBtn}>Add note</button>

              {notes.length === 0 && <p style={emptyText}>No notes yet.</p>}
              {notes.map((n) => (
                <div key={n.id} style={noteItem}>
                  <p>{n.note}</p>
                  <div style={noteMeta}>
                    {n.admin_email} • {new Date(n.created_at).toLocaleString("en-GB")}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "audit" && (
            <>
              {audit.length === 0 && <p style={emptyText}>No audit events yet.</p>}
              {audit.map((a) => (
                <div key={a.id} style={noteItem}>
                  <strong>{a.action}</strong>
                  <div style={noteMeta}>
                    {a.admin_email} • {new Date(a.created_at).toLocaleString("en-GB")}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "conversations" && (
            <p style={emptyText}>AI conversations will appear here.</p>
          )}
        </div>

        <div style={footer}>
          Joined {new Date(user.created_at).toLocaleDateString("en-GB")}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Tab({ label, icon, active, onClick }: any) {
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

const page = { padding: "70px 100px", fontFamily: "'Nunito Sans', sans-serif" };
const backBtn = { display: "flex", gap: 8, marginBottom: 30, background: "none", border: "none", cursor: "pointer", color: "#666" };
const card = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20, padding: 44, maxWidth: 960 };
const headerRow = { display: "flex", gap: 20, marginBottom: 30 };
const iconWrap = { width: 56, height: 56, borderRadius: 14, background: "#F4F4F4", display: "flex", alignItems: "center", justifyContent: "center" };
const title = { fontFamily: "'Gilda Display', serif", fontSize: 32 };
const subtitle = { fontSize: 14, color: "#777" };

const metaRow = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 40 };
const metaBox = { border: "1px solid #EEE", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 };
const metaLabel = { fontSize: 12, color: "#777", fontWeight: 600 };

const badgeBase = { padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, width: "fit-content" };
const statusActive = { ...badgeBase, background: "rgba(24,63,52,0.12)", color: "#183F34" };
const statusPending = { ...badgeBase, background: "rgba(0,0,0,0.06)", color: "#666" };
const tierPlatinum = { ...badgeBase, background: "linear-gradient(135deg,#E6C87A,#C8A44B)", color: "#1A1A1A" };

const tabs = { display: "flex", gap: 12, borderBottom: "1px solid #EEE", marginBottom: 30 };
const tabBtn = { display: "flex", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#777" };
const tabActive = { borderBottom: "2px solid #183F34", color: "#183F34", fontWeight: 700 };

const tabContent = { paddingTop: 10 };
const sectionTitle = { fontSize: 14, fontWeight: 700, marginBottom: 16 };
const contactRow = { display: "flex", gap: 10, marginBottom: 10 };

const noteTextarea = { width: "100%", minHeight: 90, borderRadius: 12, border: "1px solid #DDD", padding: 14 };
const noteItem = { borderBottom: "1px solid #EEE", padding: "14px 0", fontSize: 13 };
const noteMeta = { fontSize: 11, color: "#999" };
const emptyText = { fontSize: 13, color: "#999" };

const primaryBtn = { marginTop: 10, padding: "10px 16px", borderRadius: 12, border: "none", background: "#183F34", color: "#fff", cursor: "pointer" };
const footer = { marginTop: 30, paddingTop: 20, borderTop: "1px solid #EEE", fontSize: 12, color: "#999" };
