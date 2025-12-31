"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "src/lib/supabase/client";
import { Loader2 } from "lucide-react";

type Conversation = {
  id: string;
  type: string | null;
  status: string | null;
  first_message: string | null;
  last_message: string | null;
  contact_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function ConversationsPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All types");
  const [status, setStatus] = useState("All status");

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setConversations(data);
      setLoading(false);
    };
    fetchConversations();
  }, [supabase]);

  const typeFilters = ["All types", "Vendor", "Planning"];
  const statusFilters = ["All status", "New", "In progress", "Done"];

  const filteredData = conversations.filter((c) => {
    const typeMatch = filter === "All types" || (c.type || "").toLowerCase() === filter.toLowerCase();
    const statusMatch = status === "All status" || (c.status || "").toLowerCase() === status.toLowerCase();
    return typeMatch && statusMatch;
  });

  return (
    <div style={pageWrapper}>
      <header style={header}>
        <div>
          <h1 style={pageTitle}>Concierge Conversations</h1>
          <p style={subtitle}>Recent vendor and planning chats from the 5 Star Weddings concierge.</p>
        </div>
      </header>

      {/* FILTERS */}
      <div style={filterBar}>
        {typeFilters.map((f) => (
          <button
            key={f}
            style={f === filter ? filterBtnActive : filterBtn}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        {statusFilters.map((f) => (
          <button
            key={f}
            style={f === status ? filterBtnActive : filterBtn}
            onClick={() => setStatus(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        {loading ? (
          <div style={loadingWrapper}>
            <Loader2 size={32} className="animate-spin" color="#C5A059" />
          </div>
        ) : filteredData.length === 0 ? (
          <p style={emptyText}>No conversations yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr style={tableHeadRow}>
                <th style={th}>Created</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
                <th style={th}>Message and Contact</th>
                <th style={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((conv) => (
                <tr key={conv.id} style={tableRow}>
                  <td style={td}>
                    {conv.created_at
                      ? new Date(conv.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td style={td}>{conv.type || "Planning"}</td>
                  <td style={td}>
                    <span style={statusBadge}>{conv.status || "New"}</span>
                  </td>
                  <td style={{ ...td, color: "#4A4846" }}>
                    {conv.first_message?.slice(0, 70) || "No text yet"}
                    <br />
                    <small style={{ opacity: 0.6 }}>
                      Contact: {conv.contact_name || "Unknown"}
                    </small>
                  </td>
                  <td style={td}>
                    {conv.updated_at
                      ? new Date(conv.updated_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* === STYLES === */
const pageWrapper = { background: "#FAF7F6", minHeight: "100vh", padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" };
const header = { marginBottom: "40px" };
const pageTitle = { fontFamily: "'Gilda Display', serif", fontSize: "36px", color: "#2E2B28", marginBottom: "4px" };
const subtitle = { color: "#7A7672", fontSize: "15px" };
const filterBar = { display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" as const };
const filterBtn = { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "999px", padding: "10px 18px", fontSize: "13px", color: "#2E2B28", cursor: "pointer" };
const filterBtnActive = { ...filterBtn, background: "#C5A059", color: "#2E2B28", fontWeight: 700, border: "none" };
const tableWrapper = { background: "#FFFFFF", borderRadius: "16px", boxShadow: "0 6px 20px rgba(0,0,0,0.04)", overflow: "hidden" };
const table = { width: "100%", borderCollapse: "collapse" as const };
const tableHeadRow = { background: "#F5F3F1" };
const th = { textAlign: "left" as const, padding: "16px 20px", fontSize: "13px", color: "#7A7672", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const tableRow = { borderBottom: "1px solid rgba(0,0,0,0.05)", transition: "background 0.2s", cursor: "pointer" };
const td = { padding: "16px 20px", fontSize: "14px", color: "#2E2B28" };
const statusBadge = { background: "#C5A059", color: "#2E2B28", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const };
const loadingWrapper = { display: "flex", justifyContent: "center", alignItems: "center", height: "200px" };
const emptyText = { textAlign: "center" as const, color: "#7A7672", padding: "60px 0" };
