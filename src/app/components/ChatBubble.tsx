"use client";

import Avatar from "./Avatar";

interface ChatBubbleProps {
  role: "assistant" | "user";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isAssistant ? "row" : "row-reverse",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {/* Avatar */}
      <Avatar role={role} />

      {/* Bubble */}
      <div
        style={{
          maxWidth: "75%",
          padding: "14px 18px",
          borderRadius: "18px",
          backgroundColor: isAssistant ? "#FFFFFF" : "#183F34",
          color: isAssistant ? "#111" : "#FFFFFF",
          fontFamily: "Nunito Sans, sans-serif",
          fontSize: "15px",
          lineHeight: 1.5,
          boxShadow: isAssistant
            ? "0 4px 12px rgba(0,0,0,0.06)"
            : "0 4px 12px rgba(0,0,0,0.18)",
          border: isAssistant
            ? "1px solid rgba(0,0,0,0.06)"
            : "1px solid #183F34",
          transition: "0.25s ease",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}
