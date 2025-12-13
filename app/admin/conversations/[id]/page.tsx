"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AdminNav } from "../../AdminNav";

type ConversationRow = {
  id: string;
  user_type: string;
  status: string;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_company?: string | null;
  wedding_date?: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id =
    Array.isArray(rawId) ? (rawId[0] as string) : (rawId as string | undefined);

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // live chat reply state
  const [liveReply, setLiveReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  // vendor lead or delete status (inline instead of alerts)
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversation(conversationId: string) {
      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error("Error loading conversation detail", error);
        setErrorMessage(
          `Could not load this conversation: ${
            (error as any)?.message ?? "Unknown error"
          }`
        );
      } else if (data) {
        setConversation(data as ConversationRow);
      }

      setLoading(false);
    }

    if (id) {
      void loadConversation(id);
    } else {
      setErrorMessage("No conversation id found in the route.");
    }
  }, [id]);

  // send live reply to API
  async function handleSendLiveReply() {
    if (!id || !liveReply.trim()) return;
    setSendingReply(true);
    setLiveStatus(null);

    try {
      const res = await fetch("/api/admin/conversations/send-live-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          message: liveReply.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Unknown error");
      }

      const trimmed = liveReply.trim();

      setLiveReply("");
      setLiveStatus("Message sent to this conversation.");

      // update local view of last_message and updated_at
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              last_message: trimmed,
              status: "in_progress",
              updated_at: new Date().toISOString(),
            }
          : prev
      );
    } catch (err: any) {
      console.error("live reply error", err);
      setLiveStatus(
        `Could not send this message: ${err?.message ?? "Unknown error"}`
      );
    } finally {
      setSendingReply(false);
    }
  }

  // Enter sends, Shift plus Enter makes a new line
  const canSend = !sendingReply && liveReply.trim().length > 0;

  function handleReplyKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      if (canSend) {
        void handleSendLiveReply();
      }
    }
  }

  // Create vendor lead and go straight to the new lead card
  async function handleCreateVendorLead() {
    if (!id) return;

    setActionMessage(null);

    try {
      const response = await fetch(
        "/api/admin/create-vendor-lead-from-conversation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: id }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unknown error");
      }

      const leadId: string | undefined =
        data.lead_id || data.leadId || data.id;

      if (leadId) {
        setActionMessage("Vendor lead created, opening lead card.");
        router.push(`/admin/leads/${leadId}`);
      } else {
        // fallback, no id returned
        setActionMessage(
          "Vendor lead created from this conversation, you can view it later in Vendor leads."
        );
      }
    } catch (error: any) {
      console.error("create vendor lead error", error);
      const rawMessage: string = error?.message ?? "Unknown error";

      // Friendly path when a lead already exists for this conversation
      if (rawMessage.includes("vendor_leads_conversation_id_key")) {
        // Try to look up the existing lead and open it
        if (supabase && id) {
          try {
            const { data: rows, error: lookupError } = await supabase
              .from("vendor_leads")
              .select("id")
              .eq("conversation_id", id)
              .limit(1);

            if (!lookupError && rows && rows.length > 0) {
              const existingLeadId = rows[0].id as string;
              setActionMessage(
                "A vendor lead already exists for this conversation. Opening that lead card."
              );
              router.push(`/admin/leads/${existingLeadId}`);
              return;
            }
          } catch (lookupErr) {
            console.error(
              "lookup existing vendor lead for conversation failed",
              lookupErr
            );
          }
        }

        // Fallback if we cannot look it up for some reason
        setActionMessage(
          "A vendor lead has already been created from this conversation. You can find it in Vendor leads."
        );
        return;
      }

      // Generic error for anything else
      setActionMessage(
        `Could not create a vendor lead from this conversation: ${rawMessage}`
      );
    }
  }

  async function handleDeleteConversation() {
    if (!id) return;

    setActionMessage(null);

    try {
      const response = await fetch("/api/admin/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unknown error");
      }

      router.push("/admin/conversations");
    } catch (error: any) {
      console.error("delete conversation error", error);
      setActionMessage(
        `Could not delete this conversation: ${
          error?.message ?? "Unknown error"
        }`
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f4ef",
        padding: 24,
      }}
    >
      <AdminNav />

      <div
        style={{
          maxWidth: 1040,
          margin: "24px auto 0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Playfair Display","Gilda Display",serif',
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: -0.4,
                color: "#111",
              }}
            >
              Conversation detail
            </h1>
            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: 13,
                color: "#666",
              }}
            >
              Review this concierge session before deciding the next step or
              taking over as a human.
            </p>
          </div>

          <a
            href="/admin/conversations"
            style={{
              fontSize: 12,
              color: "#183F34",
              textDecoration: "none",
              borderRadius: 999,
              border: "1px solid #183F34",
              padding: "6px 12px",
            }}
          >
            Back to conversations
          </a>
        </div>

        <div
          style={{
            borderRadius: 22,
            backgroundColor: "#ffffff",
            boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
            border: "1px solid rgba(24,63,52,0.06)",
            padding: 20,
          }}
        >
          {loading && (
            <div
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              Loading conversation details.
            </div>
          )}

          {errorMessage && !loading && (
            <div
              style={{
                fontSize: 13,
                color: "#aa1111",
              }}
            >
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && !conversation && (
            <div
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              This conversation could not be found.
            </div>
          )}

          {!loading && !errorMessage && conversation && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
                gap: 24,
              }}
            >
              {/* left column */}
              <div>
                {/* first message */}
                <div
                  style={{
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    First message
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: "#f7f4ef",
                      fontSize: 13,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {conversation.first_message || (
                      <span
                        style={{
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        No text yet
                      </span>
                    )}
                  </div>
                </div>

                {/* latest message */}
                <div
                  style={{
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Latest message
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: "#f7f4ef",
                      fontSize: 13,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {conversation.last_message || (
                      <span
                        style={{
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        No text yet
                      </span>
                    )}
                  </div>
                </div>

                {/* reply as human */}
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Reply as human
                  </div>
                  <textarea
                    value={liveReply}
                    onChange={(e) => setLiveReply(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    placeholder="Type your message to the user."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      fontSize: 13,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#777",
                      }}
                    >
                      Enter sends, Shift plus Enter makes a new line.
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleSendLiveReply()}
                      disabled={!canSend}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 999,
                        border: "none",
                        backgroundColor: canSend ? "#183F34" : "#9bb5ad",
                        color: "#ffffff",
                        fontSize: 13,
                        cursor: canSend ? "pointer" : "default",
                      }}
                    >
                      {sendingReply ? "Sending…" : "Send message"}
                    </button>
                  </div>
                  {liveStatus && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: liveStatus.startsWith("Could not")
                          ? "#aa1111"
                          : "#1c7a36",
                      }}
                    >
                      {liveStatus}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "#999",
                    }}
                  >
                    Conversation id: {conversation.id}
                  </div>
                </div>
              </div>

              {/* right column meta */}
              <div
                style={{
                  fontSize: 13,
                  color: "#444",
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 2,
                    }}
                  >
                    Type
                  </div>
                  <div>
                    {conversation.user_type === "vendor"
                      ? "Vendor"
                      : conversation.user_type === "planning"
                      ? "Planning"
                      : conversation.user_type || "Unknown"}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 2,
                    }}
                  >
                    Status
                  </div>
                  <div>{conversation.status || "New"}</div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 2,
                    }}
                  >
                    Created
                  </div>
                  <div>{formatDateTime(conversation.created_at)}</div>
                </div>

                <div
                  style={{
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 2,
                    }}
                  >
                    Last updated
                  </div>
                  <div>{formatDateTime(conversation.updated_at)}</div>
                </div>

                <div
                  style={{
                    marginBottom: 14,
                    paddingTop: 6,
                    borderTop: "1px solid #f0ebe1",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 4,
                    }}
                  >
                    Contact details
                  </div>

                  <div>
                    <strong>{conversation.contact_name || "Not set"}</strong>
                  </div>

                  {conversation.contact_company && (
                    <div>{conversation.contact_company}</div>
                  )}

                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    {conversation.contact_email || "No email"}
                  </div>

                  {conversation.contact_phone && (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: "#777",
                      }}
                    >
                      {conversation.contact_phone}
                    </div>
                  )}

                  {conversation.wedding_date && (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: "#777",
                      }}
                    >
                      Wedding date: {conversation.wedding_date}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    paddingTop: 6,
                    borderTop: "1px solid #f0ebe1",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 4,
                    }}
                  >
                    Live chat
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#1c7a36",
                    }}
                  >
                    You are active in this chat as Admin. Use the reply box on
                    the left whenever you want to send a message.
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 6,
                    borderTop: "1px solid #f0ebe1",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 4,
                    }}
                  >
                    Vendor lead
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleCreateVendorLead}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "none",
                        backgroundColor: "#183F34",
                        color: "#ffffff",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Create vendor lead
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteConversation}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid #cc4444",
                        backgroundColor: "#ffffff",
                        color: "#cc4444",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Delete conversation
                    </button>
                  </div>

                  {actionMessage && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: actionMessage.startsWith("Could not")
                          ? "#aa1111"
                          : "#1c7a36",
                      }}
                    >
                      {actionMessage}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#777",
                  }}
                >
                  Later we can add extra fields here such as vendor name and
                  budget so the lead card feels richer from the first click.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
