"use client";

import { useEffect, useState } from "react";

type ChatRow = {
  id: number;
  created_at: string;
  role: "vendor" | "assistant";
  message: string;
};

export default function LiveVendorChatFeed() {
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      const res = await fetch("/api/admin/vendor-chat-feed");
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to load feed");
      }

      setRows(json.rows || []);
    } catch (err) {
      console.error("LIVE FEED ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
    const timer = setInterval(loadFeed, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "16px",
        background: "#fafafa",
        border: "1px solid rgba(0,0,0,0.08)",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          marginBottom: 6,
          color: "#183F34",
        }}
      >
        Live Vendor Chat Feed
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 18,
        }}
      >
        This view shows the latest messages vendors have sent to the concierge.
        It refreshes automatically every few seconds.
      </p>

      {loading && rows.length === 0 ? (
        <p style={{ fontSize: 14, color: "#666" }}>Loading feed…</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 14, color: "#666" }}>No chat messages yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: row.role === "vendor" ? "#183F34" : "#666",
                    marginBottom: 4,
                  }}
                >
                  {row.role === "vendor" ? "Vendor" : "Assistant"}
                </div>
                <div style={{ fontSize: 14, color: "#222" }}>
                  {row.message}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  whiteSpace: "nowrap",
                }}
              >
                {new Date(row.created_at).toLocaleString("en-GB")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
