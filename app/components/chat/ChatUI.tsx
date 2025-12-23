"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
};

type Props = {
  title?: string;
  subtitle?: string;

  initialMessages?: ChatMessage[];

  placeholder?: string;

  onSend?: (text: string) => Promise<ChatMessage | null> | ChatMessage | null;

  disabled?: boolean;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 20,
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        border: "1px solid rgba(24,63,52,0.08)",
        overflow: "hidden",
      }}
    >
      {children}
    </section>
  );
}

function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderBottom: "1px solid rgba(24,63,52,0.10)",
        background: "#fbf8f3",
      }}
    >
      <div
        style={{
          fontFamily: '"Gilda Display","Playfair Display",serif',
          fontSize: 20,
          fontWeight: 400,
          color: "#183F34",
          margin: 0,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: ChatRole;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  const isSystem = role === "system";

  const bg = isSystem ? "#f4f4f5" : isUser ? "#183F34" : "#ffffff";
  const color = isSystem ? "#444" : isUser ? "#ffffff" : "#111";
  const border = isUser ? "1px solid rgba(0,0,0,0)" : "1px solid rgba(24,63,52,0.10)";

  return (
    <div
      style={{
        maxWidth: 680,
        padding: "12px 14px",
        borderRadius: 18,
        background: bg,
        color,
        border,
        lineHeight: 1.55,
        fontSize: 14,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
}

function StatusPill({
  text,
  tone,
}: {
  text: string;
  tone: "ok" | "error" | "neutral";
}) {
  const bg =
    tone === "ok" ? "rgba(47,191,113,0.12)" : tone === "error" ? "rgba(239,68,68,0.12)" : "rgba(24,63,52,0.08)";
  const color =
    tone === "ok" ? "#1f7a4d" : tone === "error" ? "#b91c1c" : "#183F34";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        border: "1px solid rgba(24,63,52,0.10)",
      }}
    >
      {text}
    </span>
  );
}

export default function ChatUI({
  title = "Chat",
  subtitle,
  initialMessages = [],
  placeholder = "Type your message",
  onSend,
  disabled,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: "ok" | "error" | "neutral" } | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => {
    if (disabled) return false;
    if (sending) return false;
    return input.trim().length > 0;
  }, [disabled, sending, input]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !canSend) return;

    setStatus(null);
    setSending(true);

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      let reply: ChatMessage | null = null;

      if (onSend) {
        const result = await onSend(text);
        reply = result ? result : null;
      } else {
        reply = {
          id: uid(),
          role: "assistant",
          content:
            "Wire this to your API and I will reply with live responses. For now, this is a placeholder assistant message.",
          createdAt: new Date().toISOString(),
        };
      }

      if (reply) {
        setMessages((m) => [...m, reply as ChatMessage]);
        setStatus({ text: "Sent", tone: "ok" });
      } else {
        setStatus({ text: "No reply returned", tone: "neutral" });
      }
    } catch (e: any) {
      setStatus({
        text: e?.message ? `Send failed, ${e.message}` : "Send failed",
        tone: "error",
      });

      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "system",
          content: "Message failed to send. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => setStatus(null), 2500);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Card>
      <TopBar title={title} subtitle={subtitle} />

      <div
        ref={listRef}
        style={{
          height: 520,
          overflowY: "auto",
          padding: 18,
          background: "#ffffff",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: "#777", fontSize: 14 }}>
            No messages yet. Start the conversation.
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Bubble role={m.role}>{m.content}</Bubble>
            </div>
          ))}

          {sending ? (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <Bubble role="assistant">Typing…</Bubble>
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid rgba(24,63,52,0.10)",
          background: "#fbf8f3",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={!!disabled || sending}
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              borderRadius: 16,
              border: "1px solid rgba(24,63,52,0.18)",
              padding: "12px 12px",
              fontSize: 14,
              outline: "none",
              background: disabled ? "#f4f4f5" : "#ffffff",
              color: "#111",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              padding: "12px 16px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0)",
              background: canSend ? "#183F34" : "rgba(24,63,52,0.35)",
              color: "#ffffff",
              fontWeight: 800,
              cursor: canSend ? "pointer" : "not-allowed",
              minWidth: 110,
            }}
          >
            {sending ? "Sending" : "Send"}
          </button>
        </div>

        <div style={{ marginTop: 12, minHeight: 24 }}>
          {status ? <StatusPill text={status.text} tone={status.tone} /> : null}
        </div>
      </div>
    </Card>
  );
}
