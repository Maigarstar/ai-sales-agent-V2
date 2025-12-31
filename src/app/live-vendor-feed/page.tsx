"use client";

import { useEffect, useRef, useState } from "react";

type FeedMessage = {
  id: string;
  created_at: string;
  role: string;
  content: string;
};

export default function LiveVendorFeedPage() {
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed() {
    try {
      const res = await fetch("/api/vendors-chat-feed");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load feed");
      }

      setMessages(data.messages || []);
      setError(null);
    } catch (err: any) {
      console.error("LIVE FEED ERROR:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Nunito Sans, sans-serif",
      }}
    >
      <h1
        style={{
          fontFamily: "Gilda Display, serif",
          fontSize: "30px",
          marginBottom: "6px",
          color: "#183F34",
        }}
      >
        Live Vendor Chat Feed
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "#555",
          marginBottom: "18px",
        }}
      >
        This view shows the latest messages vendors send to the concierge. It refreshes every few seconds.
      </p>

      <div
        ref={scrollRef}
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "12px",
          padding: "16px",
          height: "520px",
          overflowY: "auto",
          background: "#FAFAFA",
        }}
      >
        {loading && <p style={{ fontSize: "13px" }}>Loading feed…</p>}

        {error && (
          <p style={{ fontSize: "13px", color: "red" }}>
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p style={{ fontSize: "13px", opacity: 0.7 }}>
            No messages yet.
          </p>
        )}

        {!loading &&
          !error &&
          messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: "10px",
                display: "flex",
                justifyContent:
                  m.role === "assistant" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  background:
                    m.role === "assistant" ? "#E1F3EA" : "#FFFFFF",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#777",
                    marginBottom: "2px",
                  }}
                >
                  {m.role === "assistant" ? "Concierge" : "Vendor"} •{" "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <div>{m.content}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
