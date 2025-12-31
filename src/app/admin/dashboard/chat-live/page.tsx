"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  MessageSquare,
  User,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function LiveConversations() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const updateViewport = () => {
      setViewport(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      setChats(data || []);
      setLoading(false);
    };

    fetchChats();
    const interval = setInterval(fetchChats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={loadingState}>
        Scanning active Aura channels…
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      {/* HEADER */}
      <header style={headerContainer}>
        <div style={badge}>
          <ShieldCheck size={12} /> Live Aura Monitoring
        </div>
        <h1 style={titleText}>Conversations</h1>
        <p style={subText}>
          Real-time visibility across all active client interactions.
        </p>
      </header>

      {chats.length === 0 ? (
        <div style={emptyState}>
          <MessageSquare size={32} color="#C8A165" />
          <p style={emptyText}>No active conversations</p>
          <p style={emptySub}>
            New conversations will appear here the moment Aura engages.
          </p>
        </div>
      ) : viewport === "mobile" ? (
        <div style={mobileList}>
          {chats.map(chat => (
            <div key={chat.id} style={mobileCard}>
              <div style={mobileHeader}>
                <div style={clientInfo}>
                  <div style={avatarSmall}><User size={14} /></div>
                  <div>
                    <div style={clientName}>{chat.client_name || "New Lead"}</div>
                    <div style={clientMeta}>{chat.wedding_date || "Date TBD"}</div>
                  </div>
                </div>

                <span style={chat.is_qualified ? qualifiedTag : passiveTag}>
                  {chat.is_qualified ? "Qualified" : "Engaging"}
                </span>
              </div>

              <p style={lastMsg}>{chat.last_message || "Awaiting response…"}</p>

              <div style={mobileFooter}>
                <div style={timeInfo}>
                  <Clock size={12} /> {timeSince(chat.updated_at)}
                </div>

                <Link
                  href={`/dashboard/vendors-chat?id=${chat.id}`}
                  style={viewBtn}
                >
                  Inspect <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Last Message</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chats.map(chat => (
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
                    <div style={lastMsg}>{chat.last_message || "Awaiting response…"}</div>
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
                    <Link
                      href={`/dashboard/vendors-chat?id=${chat.id}`}
                      style={viewBtn}
                    >
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

/* UTIL */
function timeSince(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: any = { day: 86400, hour: 3600, minute: 60 };
  for (const unit in units) {
    const count = Math.floor(seconds / units[unit]);
    if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

/* STYLES */
const pageContainer = { maxWidth: 1200, margin: "0 auto", padding: 24 };
const headerContainer = { marginBottom: 40 };
const badge = { display: "inline-flex", gap: 6, color: "#C8A165", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const };
const titleText = { fontFamily: "'Gilda Display', serif", fontSize: 34, color: "#183F34" };
const subText = { color: "#666", fontSize: 14 };

const loadingState = { padding: 60, textAlign: "center" as const, color: "#999" };

const tableWrapper = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse" as const };
const tableHeaderRow = { background: "#FAFAFA" };
const thStyle = { padding: "16px 24px", fontSize: 11, color: "#AAA", textTransform: "uppercase" as const };
const tableRow = { borderBottom: "1px solid #EEE" };
const tdStyle = { padding: "18px 24px" };

const mobileList = { display: "grid", gap: 16 };
const mobileCard = { border: "1px solid #EEE", borderRadius: 12, padding: 16, background: "#fff" };
const mobileHeader = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const mobileFooter = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 };

const clientInfo = { display: "flex", gap: 12 };
const avatarSmall = { width: 32, height: 32, background: "#F4F4F4", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" };
const clientName = { fontWeight: 600, color: "#183F34" };
const clientMeta = { fontSize: 11, color: "#999" };

const lastMsg = { fontSize: 13, color: "#555", marginTop: 6 };

const timeInfo = { display: "flex", gap: 6, fontSize: 12, color: "#AAA" };

const qualifiedTag = { fontSize: 10, padding: "4px 8px", background: "rgba(24,63,52,0.1)", color: "#183F34", borderRadius: 4 };
const passiveTag = { fontSize: 10, padding: "4px 8px", background: "rgba(200,161,101,0.15)", color: "#C8A165", borderRadius: 4 };

const viewBtn = { display: "inline-flex", gap: 6, fontSize: 12, border: "1px solid #E5E7EB", padding: "8px 12px", borderRadius: 6, color: "#183F34" };

const emptyState = { border: "1px dashed #DDD", borderRadius: 10, padding: 60, textAlign: "center" as const };
const emptyText = { fontFamily: "'Gilda Display', serif", fontSize: 20, marginTop: 16 };
const emptySub = { fontSize: 14, color: "#777" };
