"use client";

import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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

type ContactDraft = {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_company: string;
  wedding_date: string;
};

function toDraft(c: ConversationRow): ContactDraft {
  return {
    contact_name: c.contact_name ?? "",
    contact_email: c.contact_email ?? "",
    contact_phone: c.contact_phone ?? "",
    contact_company: c.contact_company ?? "",
    wedding_date: c.wedding_date ?? "",
  };
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id =
    Array.isArray(rawId) ? (rawId[0] as string) : (rawId as string | undefined);

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [contactDraft, setContactDraft] = useState<ContactDraft | null>(null);
  const [contactDirty, setContactDirty] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [liveReply, setLiveReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const dash = useMemo(() => String.fromCharCode(45), []);

  const api = useMemo(() => {
    return {
      sendLiveReply: `/api/admin/conversations/send${dash}live${dash}reply`,
      createLead: `/api/admin/create${dash}vendor${dash}lead${dash}from${dash}conversation`,
      deleteConversation: `/api/admin/delete${dash}conversation`,
      cacheNoStore: "no" + dash + "store",
      headerContentType: "Content" + dash + "Type",
      localeEnGb: "en" + dash + "GB",
      optTwoDigit: "2" + dash + "digit",
      preWrap: "pre" + dash + "wrap",
    };
  }, [dash]);

  const formatDateTime = useCallback(
    (value: string | null | undefined): string => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleString(api.localeEnGb, {
        day: api.optTwoDigit as any,
        month: "short",
        hour: api.optTwoDigit as any,
        minute: api.optTwoDigit as any,
      });
    },
    [api.localeEnGb, api.optTwoDigit]
  );

  const loadConversation = useCallback(
    async (conversationId: string, opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;

      if (!silent) {
        setLoading(true);
      }
      setErrorMessage("");

      try {
        const res = await fetch(`/api/admin/conversations/${conversationId}`, {
          method: "GET",
          cache: api.cacheNoStore as RequestCache,
        });

        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Could not load this conversation");
        }

        const c = json.conversation as ConversationRow;

        setConversation((prev) => {
          if (!prev) return c;
          if (prev.updated_at === c.updated_at) return prev;
          return c;
        });

        if (!contactDirty) {
          setContactDraft(toDraft(c));
        }
      } catch (e: any) {
        console.error("Error loading conversation detail", e);
        setErrorMessage(
          `Could not load this conversation: ${e?.message ?? "Unknown error"}`
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [api.cacheNoStore, contactDirty]
  );

  useEffect(() => {
    if (!id) {
      setErrorMessage("No conversation id found in the route.");
      return;
    }
    void loadConversation(id);
  }, [id, loadConversation]);

  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      void loadConversation(id, { silent: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [id, loadConversation]);

  async function handleSaveContact() {
    if (!id || !contactDraft) return;

    setSavingContact(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/conversations/${id}`, {
        method: "PATCH",
        headers: { [api.headerContentType]: "application/json" },
        body: JSON.stringify({
          contact_name: contactDraft.contact_name,
          contact_email: contactDraft.contact_email,
          contact_phone: contactDraft.contact_phone,
          contact_company: contactDraft.contact_company,
          wedding_date: contactDraft.wedding_date,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Could not save contact details");
      }

      const updated = json.conversation as ConversationRow;
      setConversation(updated);
      setContactDraft(toDraft(updated));
      setContactDirty(false);
      setActionMessage("Contact saved.");
    } catch (e: any) {
      console.error("save contact error", e);
      setActionMessage(
        `Could not save contact details: ${e?.message ?? "Unknown error"}`
      );
    } finally {
      setSavingContact(false);
    }
  }

  async function handleSendLiveReply() {
    if (!id || !liveReply.trim()) return;
    setSendingReply(true);
    setLiveStatus(null);

    try {
      const res = await fetch(api.sendLiveReply, {
        method: "POST",
        headers: { [api.headerContentType]: "application/json" },
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
      if (canSend) void handleSendLiveReply();
    }
  }

  async function handleCreateVendorLead() {
    if (!id) return;

    setActionMessage(null);

    try {
      const response = await fetch(api.createLead, {
        method: "POST",
        headers: { [api.headerContentType]: "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unknown error");
      }

      const leadId: string | undefined = data.lead_id || data.leadId || data.id;

      if (leadId) {
        setActionMessage("Vendor lead created, opening lead card.");
        router.push(`/admin/leads/${leadId}`);
      } else {
        setActionMessage("Vendor lead created, you can view it in Vendor leads.");
      }
    } catch (error: any) {
      console.error("create vendor lead error", error);
      const rawMessage: string = error?.message ?? "Unknown error";

      if (rawMessage.includes("vendor_leads_conversation_id_key")) {
        setActionMessage(
          "A vendor lead already exists for this conversation. Open Vendor leads to view it."
        );
        return;
      }

      setActionMessage(
        `Could not create a vendor lead from this conversation: ${rawMessage}`
      );
    }
  }

  async function handleDeleteConversation() {
    if (!id) return;

    const ok = confirm(
      "Are you sure you want to delete this conversation? This cannot be undone."
    );
    if (!ok) return;

    setActionMessage(null);

    try {
      const response = await fetch(api.deleteConversation, {
        method: "POST",
        headers: { [api.headerContentType]: "application/json" },
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
            <div style={{ fontSize: 13, color: "#666" }}>
              Loading conversation details.
            </div>
          )}

          {errorMessage && !loading && (
            <div style={{ fontSize: 13, color: "#aa1111" }}>{errorMessage}</div>
          )}

          {!loading && !errorMessage && !conversation && (
            <div style={{ fontSize: 13, color: "#666" }}>
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
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    First message
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: "#f7f4ef",
                      fontSize: 13,
                      whiteSpace: api.preWrap as any,
                      lineHeight: 1.5,
                      color: "#333",
                    }}
                  >
                    {conversation.first_message || (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>
                        No text yet
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Latest message
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: "#f7f4ef",
                      fontSize: 13,
                      whiteSpace: api.preWrap as any,
                      lineHeight: 1.5,
                      color: "#333",
                    }}
                  >
                    {conversation.last_message || (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>
                        No text yet
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
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
                    <div style={{ fontSize: 11, color: "#777" }}>
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

                  <div style={{ marginTop: 10, fontSize: 11, color: "#999" }}>
                    Conversation id: {conversation.id}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#444" }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 2 }}>
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

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 2 }}>
                    Status
                  </div>
                  <div>{conversation.status || "New"}</div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 2 }}>
                    Created
                  </div>
                  <div>{formatDateTime(conversation.created_at)}</div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 2 }}>
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
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
                    Contact details
                  </div>

                  {contactDraft && (
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        value={contactDraft.contact_name}
                        onChange={(e) => {
                          setContactDraft({ ...contactDraft, contact_name: e.target.value });
                          setContactDirty(true);
                        }}
                        placeholder="Contact name"
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          fontSize: 13,
                        }}
                      />
                      <input
                        value={contactDraft.contact_company}
                        onChange={(e) => {
                          setContactDraft({ ...contactDraft, contact_company: e.target.value });
                          setContactDirty(true);
                        }}
                        placeholder="Company"
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          fontSize: 13,
                        }}
                      />
                      <input
                        value={contactDraft.contact_email}
                        onChange={(e) => {
                          setContactDraft({ ...contactDraft, contact_email: e.target.value });
                          setContactDirty(true);
                        }}
                        placeholder="Email"
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          fontSize: 13,
                        }}
                      />
                      <input
                        value={contactDraft.contact_phone}
                        onChange={(e) => {
                          setContactDraft({ ...contactDraft, contact_phone: e.target.value });
                          setContactDirty(true);
                        }}
                        placeholder="Phone"
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          fontSize: 13,
                        }}
                      />
                      <input
                        value={contactDraft.wedding_date}
                        onChange={(e) => {
                          setContactDraft({ ...contactDraft, wedding_date: e.target.value });
                          setContactDirty(true);
                        }}
                        placeholder="Wedding date"
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          fontSize: 13,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => void handleSaveContact()}
                        disabled={savingContact}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 999,
                          border: "none",
                          backgroundColor: savingContact ? "#9bb5ad" : "#183F34",
                          color: "#ffffff",
                          fontSize: 13,
                          cursor: savingContact ? "default" : "pointer",
                          justifySelf: "start",
                        }}
                      >
                        {savingContact ? "Saving…" : "Save contact"}
                      </button>
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
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>
                    Vendor lead
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

                <div style={{ marginTop: 8, fontSize: 12, color: "#777" }}>
                  Add extra fields here later, vendor name, budget, and lead score.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
