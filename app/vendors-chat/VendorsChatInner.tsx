"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type ChatRole = "user" | "assistant";
type ChatType = "vendor" | "couple";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

function introFor(chatType: ChatType): string {
  if (chatType === "couple") {
    return "Hello, I am your 5 Star Weddings concierge. Tell me a little about your wedding plans, location and guest numbers, and I can help you find the right venues and vendors.";
  }
  return "Hello, I am your 5 Star Weddings concierge. Tell me a little about your venue or business and what kind of enquiries you would like more of.";
}

export default function VendorsChatPage() {
  const searchParams = useSearchParams();

  const isEmbed = searchParams.get("embed") === "1";

  const initialChatType: ChatType =
    searchParams.get("chatType") === "couple" ? "couple" : "vendor";

  const [chatType, setChatType] = useState<ChatType>(initialChatType);

  const organisationId =
    searchParams.get("organisationId") ||
    "9ecd45ab-6ed2-46fa-914b-82be313e06e4";

  const agentId =
    searchParams.get("agentId") ||
    "70660422-489c-4b7d-81ae-b786e43050db";

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: introFor(initialChatType) },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // new, track conversation id that comes back from the backend
  const [conversationId, setConversationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset conversation when switching between vendor and couple
  useEffect(() => {
    setMessages([{ role: "assistant", content: introFor(chatType) }]);
    setError(null);
    setInput("");
    setConversationId(null);
  }, [chatType]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

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
          chatType,
          messages: newMessages,
          // pass conversation id if you have one
          conversationId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Chat request failed");
      }

      // pick up conversation id from the backend if it is sent back
      const newConversationId =
        json.conversationId ||
        json.conversation_id ||
        json.conversation?.id ||
        null;

      if (newConversationId) {
        setConversationId(newConversationId);
      }

      const replyText: string =
        json.reply || "Thank you, I have received your message.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
    } catch (err: any) {
      console.error("vendors chat error", err);
      setError(err?.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // new, delete or clear the chat from the user side
  async function handleDeleteConversation() {
    // if we do not know the id yet, just clear the local chat
    if (!conversationId) {
      const yes = confirm("Clear this chat and start again");
      if (!yes) return;
      setMessages([{ role: "assistant", content: introFor(chatType) }]);
      setError(null);
      setInput("");
      return;
    }

    const yes = confirm("Delete this conversation and its messages");
    if (!yes) return;

    try {
      const res = await fetch("/api/vendor/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      const json = await res.json();
      if (!json.ok) {
        alert(json.error || "Could not delete this conversation");
        return;
      }

      // reset to a fresh intro
      setMessages([{ role: "assistant", content: introFor(chatType) }]);
      setError(null);
      setInput("");
      setConversationId(null);
    } catch (err) {
      console.error("vendor delete conversation error", err);
      alert("There was an error deleting this conversation");
    }
  }

  const wrapperPadding = isEmbed ? "8px 10px" : "32px";
  const wrapperMaxWidth = isEmbed ? "100%" : "720px";
  const wrapperHeight = isEmbed ? "100vh" : "calc(100vh - 64px)";

  return (
    <div
      style={{
        padding: wrapperPadding,
        maxWidth: wrapperMaxWidth,
        margin: isEmbed ? "0" : "0 auto",
        height: wrapperHeight,
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

      {/* Toggle tabs */}
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
          type="button"
          onClick={() => setChatType("vendor")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            backgroundColor:
              chatType === "vendor" ? "#183F34" : "transparent",
            color: chatType === "vendor" ? "#ffffff" : "#183F34",
          }}
        >
          I am a venue or vendor
        </button>
        <button
          type="button"
          onClick={() => setChatType("couple")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            backgroundColor:
              chatType === "couple" ? "#183F34" : "transparent",
            color: chatType === "couple" ? "#ffffff" : "#183F34",
          }}
        >
          I am a couple planning a wedding
        </button>
      </div>

      {/* Chat container */}
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
        {/* new header row inside the chat box */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#183F34" }}>
            Chat with your concierge
          </span>
          <button
            type="button"
            onClick={handleDeleteConversation}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid #e11d48",
              backgroundColor: "#ffffff",
              color: "#e11d48",
              cursor: "pointer",
            }}
          >
            Delete chat
          </button>
        </div>

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
                  backgroundColor:
                    m.role === "user" ? "#183F34" : "#f0f4f3",
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
          <div
            style={{
              marginBottom: 6,
              fontSize: 12,
              color: "crimson",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid #e5e5e5",
            paddingTop: 8,
          }}
        >
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
            <span
              style={{
                fontSize: 11,
                color: "#888",
              }}
            >
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
                cursor:
                  loading || !input.trim() ? "default" : "pointer",
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
            rel="noreferrer"
            style={{ color: "#183F34", textDecoration: "none" }}
          >
            Taigenic.ai
          </a>
        </p>
      )}
    </div>
  );
}
