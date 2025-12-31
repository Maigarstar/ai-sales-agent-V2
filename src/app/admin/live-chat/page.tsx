"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
type ConversationRow = {
  id: string;
  user_type: string | null;
  status: string | null;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

// Supabase Init
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

/* === HELPER FUNCTIONS === */
function formatCreated(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status: string | null | undefined) {
  const raw = (status || "").toLowerCase();
  if (raw === "in_progress")
    return {
      label: "In Progress",
      bg: "rgba(34, 197, 94, 0.1)",
      color: "#22C55E",
    };
  if (raw === "done")
    return {
      label: "Done",
      bg: "rgba(255, 255, 255, 0.05)",
      color: "#94A39F",
    };
  return {
    label: "New Intercept",
    bg: "rgba(197, 160, 89, 0.1)",
    color: "#C5A059",
  };
}

/* === MAIN COMPONENT === */
export default function LiveChatQueuePage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    async function loadQueue() {
      setLoading(true);
      const { data, error } = await sb!
        .from("conversations")
        .select("*")
        .or("status.is.null,status.eq.new,status.eq.open,status.eq.in_progress")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) setErrorMessage(error.message);
      else if (data) setRows(data as ConversationRow[]);
      setLoading(false);
    }

    loadQueue();

    const channel = sb
      .channel("live-chat-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return (
    <div style={pageContainer}>
      {/* Header */}
      <div style={headerSection}>
        <h1 style={titleStyle}>
          LIVE CHAT <span style={{ color: "#C5A059" }}>QUEUE</span>
        </h1>
        <p style={subtitleStyle}>
          Active neural intercepts requiring human intelligence.
        </p>
      </div>

      {errorMessage && <div style={errorBanner}>{errorMessage}</div>}

      <div style={tableContainer}>
        {/* Table Header */}
        <div style={tableHeader}>
          <div>CREATED</div>
          <div>IDENTITY</div>
          <div>NEURAL SUMMARY</div>
          <div style={{ textAlign: "right" }}>STATUS</div>
        </div>

        {loading && <div style={loadingText}>Synchronizing data...</div>}

        {rows.map((row) => {
          const status = getStatusInfo(row.status);
          return (
            <div key={row.id} style={rowStyle}>
              <div style={timeText}>{formatCreated(row.created_at)}</div>
              <div style={identityText}>
                {row.contact_name || "Anonymous Guest"}
              </div>

              <div style={summaryContainer}>
                <div style={summaryText}>
                  {row.first_message || "Aura is processing..."}
                </div>
                {row.contact_email && (
                  <div style={emailText}>{row.contact_email}</div>
                )}
              </div>

              <div style={actionContainer}>
                <span
                  style={{
                    ...statusBadge,
                    backgroundColor: status.bg,
                    color: status.color,
                  }}
                >
                  {status.label}
                </span>
                <Link href={`/admin/conversations/${row.id}`} style={openLink}>
                  INTERCEPT CHAT
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* === LUXURY MIDNIGHT STYLES === */

const pageContainer: React.CSSProperties = {
  color: "#E0E7E5",
  padding: "24px",
};

const headerSection: React.CSSProperties = {
  marginBottom: "40px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "32px",
  letterSpacing: "3px",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#94A39F",
  marginTop: "8px",
  letterSpacing: "1px",
};

const tableContainer: React.CSSProperties = {
  backgroundColor: "#141615",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.05)",
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "160px 200px 1fr 180px",
  padding: "16px 24px",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#94A39F",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  textTransform: "uppercase",
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "160px 200px 1fr 180px",
  padding: "18px 24px",
  alignItems: "center",
  borderBottom: "1px solid rgba(255,255,255,0.03)",
};

const timeText: React.CSSProperties = {
  fontSize: "12px",
  color: "#AEB8B6",
};

const identityText: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#E0E7E5",
};

const summaryContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const summaryText: React.CSSProperties = {
  fontSize: "13px",
  color: "#C8D0CD",
  marginBottom: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const emailText: React.CSSProperties = {
  fontSize: "12px",
  color: "#7C8784",
};

const actionContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "8px",
};

const statusBadge: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const openLink: React.CSSProperties = {
  fontSize: "11px",
  color: "#C5A059",
  textDecoration: "none",
  letterSpacing: "1px",
  border: "1px solid rgba(197,160,89,0.3)",
  padding: "4px 10px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
};

const loadingText: React.CSSProperties = {
  padding: "24px",
  textAlign: "center",
  color: "#94A39F",
  fontSize: "13px",
};

const errorBanner: React.CSSProperties = {
  backgroundColor: "rgba(255,0,0,0.1)",
  color: "#ff6b6b",
  padding: "12px 16px",
  borderRadius: "6px",
  marginBottom: "20px",
  fontSize: "13px",
};
