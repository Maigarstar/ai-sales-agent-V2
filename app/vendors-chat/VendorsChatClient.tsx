"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* =======================
   Types
======================= */

type ChatRole = "user" | "assistant";
type ChatType = "vendor" | "couple";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

/* =======================
   Helpers
======================= */

function introFor(chatType: ChatType): string {
  if (chatType === "couple") {
    return "Hello, I am your 5 Star Weddings concierge. Tell me a little about your wedding plans, location and guest numbers, and I can help you find the right venues and vendors.";
  }
  return "Hello, I am your 5 Star Weddings concierge. Tell me a little about your venue or business and what kind of enquiries you would like more of.";
}

/* =======================
   Icons
======================= */

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 18v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =======================
   Component
======================= */

export default function VendorsChatClient() {
  const searchParams = useSearchParams();

  const isEmbed = searchParams.get("embed") === "1";

  const initialChatType: ChatType =
    searchParams.get("chatType") === "couple" ? "couple" : "vendor";

  const organisationId =
    searchParams.get("organisationId") ??
    "9ecd45ab-6ed2-46fa-914b-82be313e06e4";

  const agentId =
    searchParams.get("agentId") ??
    "70660422-489c-4b7d-81ae-b786e43050db";

  const [chatType, setChatType] = useState<ChatType>(initialChatType);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: introFor(initialChatType) },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* =======================
     Auto scroll
  ======================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =======================
     Voice input
  ======================= */

  const recognitionRef = useRef<any>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (!transcript) return;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      inputRef.current?.focus();
    };

    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    setVoiceSupported(true);
  }, []);

  function handleVoiceInput() {
    if (!voiceSupported || listening || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  }

  /* =======================
     Reset on tab change
  ======================= */

  useEffect(() => {
    setMessages([{ role: "assistant", content: introFor(chatType) }]);
    setInput("");
    setConversationId(null);
    setError(null);
    setListening(false);
  }, [chatType]);

  /* =======================
     Send message
  ======================= */

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user" as const, content: text },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationId,
          agentId,
          chatType,
          messages: nextMessages,
          conversationId,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      if (json.conversationId) {
        setConversationId(json.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: json.reply },
      ]);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
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

  /* =======================
     Render (unchanged UI)
  ======================= */

  return (
    <div
      style={{
        padding: isEmbed ? "8px 10px" : "32px",
        maxWidth: isEmbed ? "100%" : "720px",
        margin: isEmbed ? "0" : "0 auto",
        height: isEmbed ? "100vh" : "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isEmbed ? "#ffffff" : "#f7f7f7",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Toggle */}
      <div
        style={{
          display: "flex",
          borderRadius: 999,
          border: "1px solid #d4d4d4",
          overflow: "hidden",
          marginBottom: 12,
          backgroundColor: "#ffffff",
        }}
      >
        <button
          onClick={() => setChatType("vendor")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            backgroundColor: chatType === "vendor" ? "#183F34" : "transparent",
            color: chatType === "vendor" ? "#ffffff" : "#183F34",
            cursor: "pointer",
          }}
        >
          I am a venue or vendor
        </button>

        <button
          onClick={() => setChatType("couple")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            backgroundColor: chatType === "couple" ? "#183F34" : "transparent",
            color: chatType === "couple" ? "#ffffff" : "#183F34",
            cursor: "pointer",
          }}
        >
          I am a couple planning a wedding
        </button>
      </div>

      {/* Chat */}
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
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  backgroundColor:
                    m.role === "user" ? "#183F34" : "#f0f4f3",
                  color: m.role === "user" ? "#ffffff" : "#183F34",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div style={{ color: "crimson", fontSize: 12 }}>{error}</div>
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
              padding: 8,
              borderRadius: 8,
              border: "1px solid #cccccc",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <span style={{ fontSize: 11, color: "#888" }}>
              {listening
                ? "Listening… speak now."
                : "Press Enter to send, Shift plus Enter for a new line."}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              {voiceSupported && (
                <button
                  onClick={handleVoiceInput}
                  disabled={loading || listening}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <MicIcon />
                </button>
              )}

              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor:
                    loading || !input.trim() ? "#cccccc" : "#183F34",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
