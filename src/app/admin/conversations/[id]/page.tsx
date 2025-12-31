"use client";

import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ConversationRow = {
  id: string;
  user_type: string;
  status: string;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_company?: string | null;
  wedding_date?: string | null;
};

type ContactDraft = {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_company: string;
  wedding_date: string;
};

function toDraft(c: ConversationRow): ContactDraft {
  return {
    contact_name: c.contact_name ?? "",
    contact_email: c.contact_email ?? "",
    contact_phone: c.contact_phone ?? "",
    contact_company: c.contact_company ?? "",
    wedding_date: c.wedding_date ?? "",
  };
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [contactDraft, setContactDraft] = useState<ContactDraft | null>(null);
  const [contactDirty, setContactDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [liveReply, setLiveReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const loadConversation = useCallback(async (conversationId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Load failed");
      const c = json.conversation as ConversationRow;
      setConversation(c);
      if (!contactDirty) setContactDraft(toDraft(c));
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [contactDirty]);

  useEffect(() => {
    if (id) loadConversation(id as string);
  }, [id, loadConversation]);

  async function handleSendLiveReply() {
    if (!id || !liveReply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/conversations/send-live-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, message: liveReply.trim() }),
      });
      if (!res.ok) throw new Error("Reply failed");
      setLiveReply("");
      setActionMessage({ text: "Message sent.", type: 'success' });
      loadConversation(id as string, true);
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div style={pageWrapper}>
      {/* AdminNav is handled by layout.tsx - No crash here anymore */}
      
      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>CONVERSATION <span style={{ color: "#C5A059" }}>DETAIL</span></h1>
          <p style={subtitleStyle}>Intercepting Concierge Session: {id}</p>
        </div>
        <Link href="/admin/live-chat" style={backBtn}>Back to Queue</Link>
      </div>

      <div style={mainGrid}>
        {/* CHAT INTERFACE */}
        <section style={cardStyle}>
          <div style={messageBlock}>
            <label style={labelStyle}>NEURAL ENTRY (FIRST MESSAGE)</label>
            <div style={bubbleStyle}>{conversation?.first_message || "No message data."}</div>
          </div>

          <div style={messageBlock}>
            <label style={labelStyle}>CURRENT STATUS (LAST MESSAGE)</label>
            <div style={bubbleStyle}>{conversation?.last_message || "Aura is monitoring..."}</div>
          </div>

          <div style={replySection}>
            <label style={labelStyle}>HUMAN INTERCEPT (REPLY)</label>
            <textarea
              value={liveReply}
              onChange={(e) => setLiveReply(e.target.value)}
              placeholder="Inject human response into the neural stream..."
              style={inputStyle}
              rows={4}
            />
            <button 
              onClick={handleSendLiveReply} 
              disabled={sendingReply || !liveReply.trim()} 
              style={primaryBtn}
            >
              {sendingReply ? "TRANSMITTING..." : "SEND MESSAGE"}
            </button>
          </div>
        </section>

        {/* PROSPECT INTEL */}
        <aside style={cardStyle}>
          <h2 style={sidebarTitle}>PROSPECT INTEL</h2>
          
          <div style={intelGroup}>
            <label style={labelStyle}>IDENTITY NAME</label>
            <input 
              style={fieldInput} 
              value={contactDraft?.contact_name} 
              onChange={e => {setContactDraft({...contactDraft!, contact_name: e.target.value}); setContactDirty(true);}}
            />
          </div>

          <div style={intelGroup}>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input 
              style={fieldInput} 
              value={contactDraft?.contact_email} 
              onChange={e => {setContactDraft({...contactDraft!, contact_email: e.target.value}); setContactDirty(true);}}
            />
          </div>

          <div style={intelGroup}>
            <label style={labelStyle}>WEDDING DATE</label>
            <input 
              style={fieldInput} 
              value={contactDraft?.wedding_date} 
              onChange={e => {setContactDraft({...contactDraft!, wedding_date: e.target.value}); setContactDirty(true);}}
            />
          </div>

          <div style={actionStack}>
            <button style={saveBtn} onClick={() => {}}>SAVE INTEL</button>
            <button style={goldBtn} onClick={() => {}}>CREATE VENDOR LEAD</button>
            <button style={dangerBtn} onClick={() => {}}>TERMINATE CONVERSATION</button>
          </div>

          {actionMessage && (
            <p style={{ fontSize: '11px', color: actionMessage.type === 'error' ? '#FF4D4D' : '#C5A059', marginTop: '15px' }}>
              {actionMessage.text}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

/* === ELITE SYSTEM STYLES === */

const pageWrapper: React.CSSProperties = { color: "#E0E7E5" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const titleStyle: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "32px", letterSpacing: "2px", margin: 0 };
const subtitleStyle: React.CSSProperties = { fontSize: "12px", color: "#94A39F", letterSpacing: "1px", marginTop: "5px" };

const backBtn: React.CSSProperties = { 
  fontSize: "11px", color: "#C5A059", textDecoration: "none", border: "1px solid #C5A059", 
  padding: "8px 16px", borderRadius: "6px", fontWeight: 700, letterSpacing: "1px" 
};

const mainGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px" };
const cardStyle: React.CSSProperties = { backgroundColor: "#141615", padding: "30px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" };

const messageBlock: React.CSSProperties = { marginBottom: "25px" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: 700, color: "#94A39F", letterSpacing: "2px", marginBottom: "10px" };
const bubbleStyle: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "6px", fontSize: "14px", lineHeight: "1.6", border: "1px solid rgba(255,255,255,0.02)" };

const replySection: React.CSSProperties = { borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "25px" };
const inputStyle: React.CSSProperties = { width: "100%", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "15px", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "15px" };

const primaryBtn: React.CSSProperties = { backgroundColor: "#C5A059", color: "#0A0C0B", border: "none", padding: "14px 24px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer", width: "100%" };

const sidebarTitle: React.CSSProperties = { fontFamily: "'Gilda Display', serif", fontSize: "18px", color: "#C5A059", marginBottom: "25px", letterSpacing: "1px" };
const intelGroup: React.CSSProperties = { marginBottom: "20px" };
const fieldInput: React.CSSProperties = { width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "#fff", fontSize: "13px" };

const actionStack: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "10px", marginTop: "30px" };
const saveBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" };
const goldBtn: React.CSSProperties = { backgroundColor: "transparent", border: "1px solid #C5A059", color: "#C5A059", padding: "12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" };
const dangerBtn: React.CSSProperties = { backgroundColor: "transparent", border: "1px solid #FF4D4D", color: "#FF4D4D", padding: "12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" };