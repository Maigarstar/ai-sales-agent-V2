"use client";

import React, { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatMode = "vendor" | "couple";

export default function WeddingConciergePage() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";

  const organisationId =
    searchParams.get("organisationId") ||
    "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
  const agentId =
    searchParams.get("agentId") || "70660422-489c-4b7d-81ae-b786e43050db";

  const [mode, setMode] = useState<ChatMode>("couple");

  function getInitialMessage(chatMode: ChatMode): ChatMessage {
    if (chatMode === "couple") {
      return {
        role: "assistant",
        content:
          "Hello, I am your 5 Star Weddings concierge. Tell me a little about your wedding plans, location and guest numbers, and I can help you find the right venues and vendors.",
      };
    }
    return {
      role: "assistant",
      content:
        "Hello, I am your 5 Star Weddings concierge. Tell me a little about your venue or business and what kind of enquiries you would like more of.",
    };
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    getInitialMessage("couple"),
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  function switchMode(nextMode: ChatMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setMessages([getInitialMessage(nextMode)]);
    setError(null);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages: ChatMessage[] = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationId,
          agentId,
          chat_type: mode,
          messages: newMessages,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Chat request failed");
      }

      const replyText: string =
        json.reply || "Thank you, I have received your message.";

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("wedding concierge chat error", err);
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        padding: isEmbed ? "8px 10px" : "32px",
        maxWidth: isEmbed ? "100%" : "720px",
        margin: isEmbed ? "0" : "0 auto",
        height: isEmbed ? "100vh" : "calc(100vh - 64px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: isEmbed ? "#ffffff" : "#f7f7f7",
      }}
    >
      {!isEmbed && (
        <>
          <h1
            style={{
              fontSize: 24,
              marginBottom: 4,
              fontFamily: "Gilda Display, serif",
              color: "#183F34",
            }}
          >
            Wedding concierge chat
          </h1>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
            Talk to your AI concierge as if you were a venue, vendor or couple.
            Each conversation is saved and scored in your admin dashboard.
          </p>
        </>
      )}

      <div
        style={{
          display: "flex",
          borderRadius: 999,
          border: "1px solid #e2e2e2",
          overflow: "hidden",
          marginBottom: 12,
          backgroundColor: "#ffffff",
        }}
      >
        <button
          type="button"
          onClick={() => switchMode("vendor")}
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "none",
            fontSize: 13,
            cursor: "pointer",
            backgroundColor: mode === "vendor" ? "#183F34" : "transparent",
            color: mode === "vendor" ? "#ffffff" : "#183F34",
          }}
        >
          I am a venue or vendor
        </button>
        <button
          type="button"
          onClick={() => switchMode("couple")}
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "none",
            fontSize: 13,
            cursor: "pointer",
            backgroundColor: mode === "couple" ? "#183F34" : "transparent",
            color: mode === "couple" ? "#ffffff" : "#183F34",
          }}
        >
          I am a couple planning a wedding
        </button>
      </div>

      <div
        style={{
          flex: 1,
          borderRadius: 12,
          border: "1px solid #e2e2e2",
          backgroundColor: "#ffffff",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 4,
            marginBottom: 8,
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  fontSize: 14,
                  lineHeight: 1.4,
                  backgroundColor: m.role === "user" ? "#183F34" : "#f0f4f3",
                  color: m.role === "user" ? "#ffffff" : "#183F34",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 6, fontSize: 12, color: "crimson" }}>
            {error}
          </div>
        )}

        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message and press Enter to send. Shift plus Enter for a new line."
            style={{
              width: "100%",
              minHeight: 60,
              maxHeight: 120,
              resize: "vertical",
              fontSize: 14,
              padding: 8,
              borderRadius: 8,
              border: "1px solid #cccccc",
              boxSizing: "border-box",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          />
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, color: "#888" }}>
              Press Enter to send, Shift plus Enter for a new line.
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                borderRadius: 999,
                border: "none",
                cursor: loading || !input.trim() ? "default" : "pointer",
                backgroundColor:
                  loading || !input.trim() ? "#cccccc" : "#183F34",
                color: "#ffffff",
              }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      {!isEmbed && (
        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#888",
            textAlign: "right",
          }}
        >
          Powered by{" "}
          <a
            href="https://taigenic.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#183F34", textDecoration: "none" }}
          >
            Taigenic.ai
          </a>
        </p>
      )}
    </div>
  );
}
