"use client";

import { useState } from "react";

export default function VendorsChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMetadata, setLastMetadata] = useState<any>(null);

  // Parse <reply> and <metadata>
  function parseResponse(text: string) {
    const replyMatch = text.match(/<reply>([\s\S]*?)<\/reply>/);
    const metadataMatch = text.match(/<metadata>([\s\S]*?)<\/metadata>/);

    const reply = replyMatch ? replyMatch[1].trim() : text;
    let metadata = null;

    if (metadataMatch) {
      try {
        metadata = JSON.parse(metadataMatch[1]);
      } catch (err) {
        metadata = null;
      }
    }

    return { reply, metadata };
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const { reply, metadata } = parseResponse(data.reply);

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);

      if (metadata) setLastMetadata(metadata);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "There was an error processing your request." }
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Vendor AI Assistant</h1>

      {/* Chat Window */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 20,
          borderRadius: 12,
          background: "#fcfcfc",
          minHeight: 350,
          marginBottom: 20,
        }}
      >
        {messages.length === 0 && (
          <div style={{ opacity: 0.6 }}>Start the conversation…</div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                maxWidth: "75%",
                borderRadius: 16,
                background:
                  msg.role === "user" ? "#0070f3" : "#eaeaea",
                color: msg.role === "user" ? "#fff" : "#000",
                boxShadow:
                  msg.role === "user"
                    ? "0 2px 4px rgba(0,0,0,0.15)"
                    : "0 2px 4px rgba(0,0,0,0.08)",
                transition: "0.2s ease",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && <div style={{ opacity: 0.6 }}>AI is typing…</div>}
      </div>

      {/* Metadata Panel */}
      {lastMetadata && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 12,
            background: "#f7f7f7",
            marginBottom: 20,
          }}
        >
          <h3 style={{ marginBottom: 10 }}>Lead Insights</h3>
          <p><strong>Score:</strong> {lastMetadata.score}</p>
          <p><strong>Type:</strong> {lastMetadata.lead_type}</p>
          <p><strong>Category:</strong> {lastMetadata.business_category || "N/A"}</p>
          <p><strong>Location:</strong> {lastMetadata.location || "N/A"}</p>
          <p><strong>Budget:</strong> {lastMetadata.client_budget || "N/A"}</p>
          <p><strong>Timeline:</strong> {lastMetadata.timeline || "N/A"}</p>
          <p><strong>Red Flags:</strong> {lastMetadata.red_flags || "None"}</p>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            outline: "none",
          }}
          placeholder="Type your message..."
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 20px",
            background: "#0070f3",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
