"use client";

import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";

type Metadata = {
  score?: number;
  lead_type?: string;
  business_category?: string;
  location?: string;
  client_budget?: string;
  style?: string;
  marketing_channels?: string;
  [key: string]: any;
};

export default function VendorsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function parseAssistantContent(raw: string) {
    if (!raw) return { reply: "", meta: null as Metadata | null };

    const metaMatch = raw.match(/<metadata>([\s\S]*?)<\/metadata>/);
    let meta: Metadata | null = null;

    if (metaMatch && metaMatch[1]) {
      try {
        meta = JSON.parse(metaMatch[1]);
      } catch {
        meta = null;
      }
    }

    const reply = raw.replace(/<metadata>[\s\S]*?<\/metadata>/, "").trim();
    return { reply, meta };
  }

  async function saveLeadToInbox(
    allMessages: any[],
    meta: Metadata | null
  ) {
    if (!meta) return;

    try {
      await fetch("/api/vendors-chat/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          metadata: meta,
        }),
      });
    } catch (err) {
      console.error("SAVE LEAD ERROR:", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const raw = data?.reply ?? "";
      const { reply, meta } = parseAssistantContent(raw);

      const assistantMessage = {
        role: "assistant",
        content:
          reply ||
          "Thank you for your message, I am here and ready to help with your onboarding.",
      };

      const finalMessages = [...newMessages, assistantMessage];

      setMessages(finalMessages);
      if (meta) {
        setMetadata(meta);
      }

      // fire and forget, writes into Supabase so the admin feed can see it
      saveLeadToInbox(finalMessages, meta);
    } catch (err) {
      console.error("VENDORS CHAT ERROR:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Apologies, something went wrong on my side, please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "760px",
        margin: "0 auto",
        fontFamily: "Nunito Sans, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Gilda Display, serif",
          fontSize: "34px",
          color: "#183F34",
          marginBottom: "6px",
        }}
      >
        Vendor Concierge Assistant
      </h1>

      <p
        style={{
          textAlign: "center",
          maxWidth: "520px",
          margin: "0 auto 32px",
          fontSize: "16px",
          color: "#444",
          lineHeight: 1.6,
        }}
      >
        Tell us about your wedding business, venue or brand and our assistant
        will guide you through your personalised onboarding.
      </p>

      {/* chat window */}
      <div
        ref={scrollRef}
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#FAFAFA",
          borderRadius: "16px",
          padding: "24px",
          minHeight: "420px",
          maxHeight: "520px",
          overflowY: "auto",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        }}
      >
        {messages.length === 0 && !loading && (
          <p style={{ opacity: 0.6, textAlign: "center" }}>
            Start the conversation…
          </p>
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div
            style={{
              opacity: 0.6,
              marginTop: "10px",
              textAlign: "left",
              fontStyle: "italic",
            }}
          >
            Concierge is typing…
          </div>
        )}
      </div>

      {/* input and button */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message…"
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: "16px",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: "14px 24px",
            background: "#183F34",          // always your brand green
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor:
              loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "15.5px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            opacity: loading || !input.trim() ? 0.6 : 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            transition: "transform 0.08s ease, box-shadow 0.08s ease",
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
            e.currentTarget.style.boxShadow =
              "0 1px 3px rgba(0,0,0,0.18)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 2px 6px rgba(0,0,0,0.18)";
          }}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
