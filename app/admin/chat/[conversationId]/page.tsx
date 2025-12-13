"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MessageRow = {
  id: string;
  sender_type: string;
  content: string;
  created_at: string;
};

type ConversationRow = {
  id: string;
  created_at: string;
  lead_id: string | null;
  channel: string | null;
  status: string | null;
};

type LeadRow = {
  id: string;
  score: number | null;
  lead_type: string | null;
  business_category: string | null;
  location: string | null;
  lead_status: string | null;
};

export default function AdminConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversationId = params?.conversationId as string | undefined;

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);

  async function loadConversation() {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/admin/conversation-messages?conversation_id=${conversationId}`,
        { cache: "no-store" }
      );

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to load conversation");
        return;
      }

      setConversation(json.conversation || null);
      setLead(json.lead || null);
      setMessages(json.messages || []);
    } catch (err) {
      console.error("admin convo load error", err);
      setError("Could not load conversation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: text,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to send message");
        return;
      }

      const newMessage: MessageRow = json.message;
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (err) {
      console.error("admin send error", err);
      setError("There was an error sending your message");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleCreateLeadCard() {
    if (!conversationId || creatingLead) return;

    setCreatingLead(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/vendor-leads/from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Could not create lead card from this chat");
        return;
      }

      // Optional, set lead to show updated metadata
      if (json.lead) {
        setLead(json.lead);
      }

      // Optional, take them back to leads
      // router.push("/admin/leads");
    } catch (err) {
      console.error("create lead card error", err);
      setError("There was an error creating the lead card");
    } finally {
      setCreatingLead(false);
    }
  }

  if (!conversationId) {
    return (
      <div className="px-8 py-6">
        <p className="text-sm text-[#6B7065]">No conversation selected.</p>
      </div>
    );
  }

  const title = `Conversation ${conversationId.slice(0, 8)}`;

  return (
    <div className="flex h-full flex-col px-8 py-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#183F34]">{title}</h1>

          {lead ? (
            <p className="mt-1 text-sm text-[#6B7065]">
              {lead.location && <span>{lead.location} · </span>}
              {lead.lead_type || "Unclassified"} ·{" "}
              {lead.lead_status || "No status"} ·{" "}
              {lead.score != null ? `Score ${lead.score}` : "No score"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#6B7065]">
              No linked lead metadata.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreateLeadCard}
            disabled={creatingLead}
            className="rounded-full border border-[#C8A165] px-3 py-1 text-xs font-medium text-[#183F34] hover:bg-[#FFF8EE] disabled:opacity-50"
          >
            {creatingLead ? "Creating..." : "Create lead card"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/chat")}
            className="rounded-full border border-[#D6D1C7] px-3 py-1 text-xs font-medium text-[#183F34] hover:bg-[#F1EFEA]"
          >
            Back to AI Conversations
          </button>
        </div>
      </header>

      {loading && (
        <p className="text-sm text-[#6B7065]">
          Loading conversation, please wait.
        </p>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-1 flex-col rounded-xl border border-[#EAE7E2] bg-white">
          {/* Message list */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-[#6B7065]">
                No messages in this conversation yet.
              </p>
            )}

            {messages.map((m) => {
              const isUser = m.sender_type === "user";
              const isAdmin = m.sender_type === "admin";

              const alignClass = isUser ? "items-end" : "items-start";

              const bubbleBg = isUser
                ? "bg-[#183F34] text-white"
                : isAdmin
                ? "bg-[#FFF5F7] text-[#183F34]"
                : "bg-[#F0F4F3] text-[#183F34]";

              const label = isUser
                ? "User"
                : isAdmin
                ? "Admin"
                : "Assistant";

              return (
                <div key={m.id} className={`flex flex-col ${alignClass}`}>
                  <div className="mb-0.5 text-[10px] uppercase tracking-wide text-[#9A9F93]">
                    {label}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${bubbleBg}`}
                  >
                    {m.content}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#9A9F93]">
                    {new Date(m.created_at).toLocaleString("en-GB")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-[#EAE7E2] p-3">
            <div className="mb-2 text-[11px] text-[#6B7065]">
              Reply as admin. Enter sends, Shift plus Enter for a new line.
            </div>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-20 flex-1 resize-none rounded-lg border border-[#D6D1C7] px-3 py-2 text-sm text-[#183F34] outline-none focus:border-[#183F34]"
                placeholder="Type your reply to this vendor or couple..."
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className={`h-10 self-end rounded-full px-4 text-sm font-medium text-white ${
                  sending || !input.trim()
                    ? "bg-[#C4C4C4]"
                    : "bg-[#183F34] hover:bg-[#102820]"
                }`}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
