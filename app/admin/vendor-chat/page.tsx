"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../AdminNav";

// ---------- Types ----------

type MessageSnippet = {
  role: string;
  content: string;
};

type FeedRow = {
  id: string;
  created_at: string;
  messages: MessageSnippet[];
  metadata: any;
  last_user_message: string | null;
  last_assistant_message: string | null;
  score: number | null;
  lead_type: string | null;
  business_category: string | null;
  location: string | null;
  lead_status: string | null;
  chat_type?: string | null; // "vendor" or "couple" if backend sends it
};

// Map status to label and colour
function statusLabel(status: string | null | undefined) {
  const s = (status || "new").toLowerCase();
  if (s === "hot") return { label: "Hot", color: "#c62828", bg: "#ffebee" };
  if (s === "warm") return { label: "Warm", color: "#ef6c00", bg: "#fff3e0" };
  if (s === "cold") return { label: "Cold", color: "#1565c0", bg: "#e3f2fd" };
  if (s === "qualified")
    return { label: "Qualified", color: "#2e7d32", bg: "#e8f5e9" };
  if (s === "booked")
    return { label: "Booked", color: "#2e7d32", bg: "#e8f5e9" };
  if (s === "not_fit")
    return { label: "Not a fit", color: "#6d6d6d", bg: "#f0f0f0" };
  return { label: "New", color: "#555", bg: "#f5f5f5" };
}

const ALL_STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "qualified", label: "Qualified" },
  { value: "booked", label: "Booked" },
  { value: "not_fit", label: "Not a fit" },
];

export default function AdminChatPage() {
  const router = useRouter();

  const [rows, setRows] = useState<FeedRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [creatingCardId, setCreatingCardId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  // Load feed, all conversations, no tab
  async function load() {
    try {
      const res = await fetch("/api/admin/vendor-chat-feed", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Fetch failed");
      }
      setRows(json.messages || []);
    } catch (err) {
      console.error("AdminChatPage feed error", err);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  // Update lead status for a row
  async function updateStatus(conversationId: string, lead_status: string) {
    try {
      setUpdatingStatusId(conversationId);
      const res = await fetch("/api/admin/vendor-chat-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conversationId, lead_status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update status");
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === conversationId ? { ...row, lead_status } : row
        )
      );
      showToast("Lead status updated");
    } catch (err) {
      console.error("updateStatus error", err);
      showToast("Error updating status");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // Create CRM card for this conversation and go to /admin/leads/[id]
  // UPDATED: use create-vendor-lead-from-conversation instead of vendor-leads/from-chat
  async function createCard(feedRowId: string) {
    try {
      setCreatingCardId(feedRowId);

      // look up the row so we can grab the conversation id if it is in metadata
      const row = rows.find((r) => r.id === feedRowId);
      const conversationId =
        row?.metadata?.conversation_id || row?.id || feedRowId;

      const res = await fetch(
        "/api/admin/create-vendor-lead-from-conversation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to create lead");
      }

      if (json.leadId) {
        showToast("Lead card created");
        router.push(`/admin/leads/${json.leadId as string}`);
      } else {
        showToast("Lead card created from this chat");
      }
    } catch (err) {
      console.error("createCard error", err);
      showToast("Error creating lead card");
    } finally {
      setCreatingCardId(null);
    }
  }

  const filteredRows =
    statusFilter === "all"
      ? rows
      : rows.filter(
          (row) =>
            (row.lead_status || "new").toLowerCase() ===
            statusFilter.toLowerCase()
        );

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <AdminNav />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Gilda Display, serif",
              fontSize: 30,
              color: "#183F34",
              marginBottom: 6,
            }}
          >
            AI Conversations
          </h1>
          <p style={{ color: "#555", marginBottom: 0 }}>
            Latest chats from the concierge, click a row to expand and read the
            full thread.
          </p>
        </div>

        {/* Status filter */}
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#555",
              display: "block",
              marginBottom: 4,
            }}
          >
            Filter by status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              minWidth: 150,
            }}
          >
            {ALL_STATUSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f7f7f7",
            borderRadius: 8,
          }}
        >
          No chat messages yet.
        </p>
      ) : (
        <div
          style={{
            marginTop: 24,
            borderRadius: 8,
            border: "1px solid #e2e2e2",
          }}
        >
          {filteredRows.map((row, index) => {
            const isOpen = expandedId === row.id;
            const statusInfo = statusLabel(row.lead_status);
            const isUpdatingStatus = updatingStatusId === row.id;
            const isCreatingCard = creatingCardId === row.id;

            const previewUser =
              row.last_user_message || row.messages[0]?.content || "";
            const previewAssistant = row.last_assistant_message || "";

            const chatTypeLabel =
              row.chat_type === "couple"
                ? "Couple"
                : row.chat_type === "vendor"
                ? "Business or vendor"
                : null;

            return (
              <div
                key={row.id}
                style={{
                  padding: 16,
                  borderTop: index === 0 ? "none" : "1px solid #eee",
                  background: isOpen ? "#fbfbfb" : "white",
                }}
              >
                {/* summary row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1.9fr) minmax(0, 1.4fr) 130px",
                    gap: 16,
                    alignItems: "flex-start",
                    marginBottom: isOpen ? 12 : 0,
                  }}
                >
                  {/* Left: conversation summary */}
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === row.id ? null : row.id
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#999",
                        }}
                      >
                        {row.lead_type || "Unscored"}{" "}
                        {row.score != null && `(score ${row.score})`}{" "}
                        {row.business_category &&
                          `· ${row.business_category}`}{" "}
                        {row.location && `· ${row.location}`}
                      </div>
                      {chatTypeLabel && (
                        <span
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "#f2f2f2",
                            color: "#555",
                            fontWeight: 600,
                          }}
                        >
                          {chatTypeLabel}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        color: "#222",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {previewUser || "No user message found"}
                    </div>

                    {previewAssistant && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: 2,
                        }}
                      >
                        Concierge: {previewAssistant}
                      </div>
                    )}
                  </div>

                  {/* Middle: status and Create card */}
                  <div style={{ fontSize: 12 }}>
                    {/* status pill */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 8px",
                        borderRadius: 8,
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        fontWeight: 500,
                        marginBottom: 8,
                      }}
                    >
                      {statusInfo.label}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <select
                        value={(row.lead_status || "new").toLowerCase()}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value)
                        }
                        disabled={isUpdatingStatus}
                        style={{
                          flex: 1,
                          fontSize: 12,
                          padding: "5px 8px",
                          borderRadius: 8,
                          border: "1px solid #ccc",
                          background: isUpdatingStatus ? "#f5f5f5" : "white",
                          minWidth: 130,
                        }}
                      >
                        {ALL_STATUSES.filter((s) => s.value !== "all").map(
                          (opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => createCard(row.id)}
                        disabled={isCreatingCard}
                        style={{
                          fontSize: 12,
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "none",
                          cursor: isCreatingCard ? "default" : "pointer",
                          background: "#183F34",
                          color: "white",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isCreatingCard ? "Saving card…" : "Create card"}
                      </button>
                    </div>
                  </div>

                  {/* Right: time */}
                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                      textAlign: "right",
                      minWidth: 90,
                    }}
                  >
                    {row.created_at
                      ? new Date(row.created_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>

                {/* expanded transcript */}
                {isOpen && (
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px dashed #ddd",
                      fontSize: 13,
                    }}
                  >
                    {row.messages?.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: 6,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <strong style={{ width: 70, color: "#183F34" }}>
                          {m.role === "user"
                            ? row.chat_type === "couple"
                              ? "Couple"
                              : "Vendor"
                            : "Concierge"}
                        </strong>
                        <span style={{ flex: 1 }}>{m.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            padding: "10px 16px",
            borderRadius: 999,
            background: "#183F34",
            color: "white",
            fontSize: 13,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Taigenic footer */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 12,
          borderTop: "1px solid #eeeeee",
          fontSize: 12,
          color: "#777",
          textAlign: "right",
        }}
      >
        Powered by{" "}
          <a
            href="https://taigenic.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#183F34", textDecoration: "none", fontWeight: 500 }}
          >
            Taigenic.ai
          </a>
      </div>
    </div>
  );
}
