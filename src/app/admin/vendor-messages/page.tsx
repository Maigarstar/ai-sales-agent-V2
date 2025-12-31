"use client";

import { useEffect, useRef, useState } from "react";

type FeedMessage = {
  id: string;
  created_at: string;
  role: string;
  content: string;
};

const POLL_INTERVAL_MS = 20000; // 20 seconds

export default function AdminVendorMessagesPage() {
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed(showSpinner = true) {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const res = await fetch("/api/vendors-chat-feed", {
        cache: "no-store",
      });

      let data: any;

      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        console.error(
          "ADMIN LIVE FEED: non JSON response from /api/vendors-chat-feed:",
          text.slice(0, 200)
        );
        throw new Error(
          "Feed endpoint did not return JSON. Open /api/vendors-chat-feed in the browser and check the error."
        );
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load feed");
      }

      setMessages(data.messages || []);
      setError(null);
    } catch (err: any) {
      console.error("ADMIN LIVE FEED ERROR:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  // Auto polling, only when tab is visible
  useEffect(() => {
    let intervalId: any = null;

    async function startPolling() {
      await loadFeed(true);

      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          loadFeed(false);
        }
      }, POLL_INTERVAL_MS);
    }

    startPolling();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: "1040px",
        margin: "0 auto",
        fontFamily: "Nunito Sans, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <h1
          style={{
            fontFamily: "Gilda Display, serif",
            fontSize: "30px",
            color: "#183F34",
            margin: 0,
          }}
        >
          Live Vendor Chat Feed
        </h1>

        <button
          onClick={() => loadFeed(false)}
          disabled={isRefreshing}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "1px solid rgba(0,0,0,0.18)",
            background: isRefreshing ? "#f3f3f3" : "#ffffff",
            cursor: isRefreshing ? "not-allowed" : "pointer",
          }}
        >
          {isRefreshing ? "Refreshing…" : "Refresh now"}
        </button>
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "#555",
          marginBottom: "18px",
        }}
      >
        This view shows the latest messages vendors send to the concierge. It
        refreshes automatically while you are viewing this page.
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
        {loading && (
          <p style={{ fontSize: "13px", opacity: 0.7 }}>Loading feed…</p>
        )}

        {error && (
          <p style={{ fontSize: "13px", color: "red" }}>{error}</p>
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
                  background: m.role === "assistant" ? "#E1F3EA" : "#FFFFFF",
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
