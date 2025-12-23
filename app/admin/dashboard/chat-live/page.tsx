"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { MessageSquare, User, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function LiveConversations() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) console.error(error);
      if (data) setChats(data);
      setLoading(false);
    };
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center luxury-serif text-gray-500">
        Scanning Active Channels...
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <header style={headerContainer}>
        <div style={badge}>
          <ShieldCheck size={12} /> Live Aura Monitoring
        </div>
        <h1 style={titleText}>Conversations</h1>
        <p style={subText}>
          Monitor real-time interactions between Aura and your prospective clients.
        </p>
      </header>

      {chats.length === 0 ? (
        <div style={emptyState}>
          <MessageSquare size={32} color="#C8A165" />
          <p style={emptyText}>No active conversations yet.</p>
          <p style={emptySub}>
            Once Aura engages with a new lead, it will appear here for monitoring.
          </p>
        </div>
      ) : (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Last Message</th>
                <th style={thStyle}>Aura Status</th>
                <th style={thStyle}>Activity</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {chats.map((chat) => (
                <tr key={chat.id} style={tableRow}>
                  <td style={tdStyle}>
                    <div style={clientInfo}>
                      <div style={avatarSmall}><User size={14} /></div>
                      <div>
                        <div style={clientName}>{chat.client_name || "New Lead"}</div>
                        <div style={clientMeta}>{chat.wedding_date || "Date TBD"}</div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div style={lastMsg}>
                      {chat.last_message || "Awaiting response..."}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={chat.is_qualified ? qualifiedTag : passiveTag}>
                      {chat.is_qualified ? "Qualified" : "Engaging"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <div style={timeInfo}>
                      <Clock size={12} /> {timeSince(chat.updated_at)}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <Link href={`/dashboard/vendors-chat?id=${chat.id}`} style={viewBtn}>
                      Inspect <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FORMATTING & UTILITIES
   ========================================================= */
function timeSince(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count > 1) return `${count} ${unit}s ago`;
    if (count === 1) return `1 ${unit} ago`;
  }
  return "Just now";
}

/* =========================================================
   STYLES
   ========================================================= */
const pageContainer = { maxWidth: "1200px", margin: "0 auto", padding: "24px" };
const headerContainer = { marginBottom: "40px" };
const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  color: "#C8A165",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  marginBottom: "12px",
};
const titleText = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "36px",
  color: "#183F34",
  marginBottom: "8px",
};
const subText = { color: "#666", fontSize: "14px", marginBottom: "20px" };

const tableWrapper = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  textAlign: "left" as const,
};
const tableHeaderRow = { backgroundColor: "#FAFAFA", borderBottom: "1px solid #E5E7EB" };
const thStyle = {
  padding: "16px 24px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#AAA",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};
const tableRow = {
  borderBottom: "1px solid #EEE",
  transition: "all 0.2s ease",
};
const tdStyle = {
  padding: "18px 24px",
  verticalAlign: "middle" as const,
};

const clientInfo = { display: "flex", alignItems: "center", gap: "12px" };
const avatarSmall = {
  width: "32px",
  height: "32px",
  backgroundColor: "#F4F4F4",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#AAA",
};
const clientName = { fontSize: "14px", fontWeight: "600", color: "#183F34" };
const clientMeta = { fontSize: "11px", color: "#999" };
const lastMsg = {
  fontSize: "13px",
  color: "#555",
  maxWidth: "340px",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const timeInfo = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  color: "#AAA",
};

const qualifiedTag = {
  padding: "4px 8px",
  backgroundColor: "rgba(24, 63, 52, 0.08)",
  color: "#183F34",
  fontSize: "10px",
  fontWeight: "700",
  borderRadius: "4px",
  textTransform: "uppercase" as const,
};
const passiveTag = {
  padding: "4px 8px",
  backgroundColor: "rgba(200, 161, 101, 0.1)",
  color: "#C8A165",
  fontSize: "10px",
  fontWeight: "700",
  borderRadius: "4px",
  textTransform: "uppercase" as const,
};

const viewBtn = {
  background: "none",
  border: "1px solid #E5E7EB",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#183F34",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.2s ease",
};
const emptyState = {
  background: "#FFF",
  border: "1px dashed #DDD",
  borderRadius: "8px",
  textAlign: "center" as const,
  padding: "60px 20px",
  maxWidth: "800px",
  margin: "0 auto",
  boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
};
const emptyText = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "20px",
  color: "#183F34",
  marginTop: "16px",
};
const emptySub = { fontSize: "14px", color: "#777", marginTop: "6px" };
