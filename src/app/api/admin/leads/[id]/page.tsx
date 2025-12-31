"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Lead = {
  id: string;
  created_at?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  business_name?: string | null;
  business_category?: string | null;
  location?: string | null;
  lead_status?: string | null;
  lead_type?: string | null;
  score?: number | null;
  follow_up_next_step?: string | null;
  internal_note?: string | null;
  source?: string | null;
  [key: string]: any;
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [internalNote, setInternalNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [leadStatus, setLeadStatus] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLead() {
      if (!leadId) return;
      try {
        setLoading(true);
        setLoadError(null);
        setSaveMessage(null);
        setDeleteMessage(null);

        const res = await fetch(
          `/api/admin/vendor-leads/detail?id=${encodeURIComponent(leadId)}`
        );
        const json = await res.json();

        if (!res.ok || json.ok === false) {
          throw new Error(json.error || "Failed to load lead");
        }

        const data: Lead = json.lead;
        setLead(data);
        setInternalNote(data.internal_note || "");
        setNextStep(data.follow_up_next_step || "");
        setLeadStatus(data.lead_status || "new");
      } catch (err: any) {
        console.error("LeadDetail load error", err);
        setLoadError(err?.message || "Could not load lead detail");
      } finally {
        setLoading(false);
      }
    }

    loadLead();
  }, [leadId]);

  async function handleSave() {
    if (!lead) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);
      setDeleteMessage(null);

      const res = await fetch("/api/admin/vendor-leads/detail", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          lead_status: leadStatus,
          follow_up_next_step: nextStep,
          internal_note: internalNote,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "Failed to save lead");
      }

      const updated: Lead = json.lead;
      setLead(updated);
      setInternalNote(updated.internal_note || "");
      setNextStep(updated.follow_up_next_step || "");
      setLeadStatus(updated.lead_status || leadStatus || "new");

      setSaveMessage("Saved");
    } catch (err: any) {
      console.error("LeadDetail save error", err);
      setSaveMessage(err?.message || "Error saving lead");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!leadId || deleting) return;

    try {
      setDeleting(true);
      setDeleteMessage(null);
      setSaveMessage(null);

      const res = await fetch("/api/admin/delete-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to delete lead");
      }

      setDeleteMessage("Lead deleted");
      // tiny pause so the message can show, then back to list
      setTimeout(() => {
        router.push("/admin/leads");
      }, 600);
    } catch (err: any) {
      console.error("LeadDetail delete error", err);
      setDeleteMessage(err?.message || "Could not delete this lead");
    } finally {
      setDeleting(false);
    }
  }

  if (!leadId) {
    return (
      <div style={{ padding: 32 }}>
        <p>No lead id in URL</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 960,
        margin: "0 auto",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/admin/leads")}
        style={{
          border: "none",
          background: "transparent",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 8,
        }}
      >
        ← Back to leads
      </button>

      <h1
        style={{
          fontSize: 24,
          marginBottom: 4,
          fontFamily: "Gilda Display, serif",
          color: "#183F34",
        }}
      >
        Lead detail
      </h1>

      {loading && <p>Loading lead…</p>}

      {loadError && (
        <p style={{ color: "crimson", marginTop: 8 }}>{loadError}</p>
      )}

      {lead && (
        <>
          <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
            Vendor enquiry from{" "}
            {lead.source || "web_chat"} •{" "}
            {lead.created_at
              ? new Date(lead.created_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </p>

          {/* top summary card */}
          <div
            style={{
              borderRadius: 10,
              border: "1px solid #e3e3e3",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Contact</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.name || "Unknown contact"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Email</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.email || "No email"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Phone</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.phone || "No phone"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Business</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.business_name || "Not provided"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Category</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.business_category || "Not set"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Location</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.location || "Not set"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Score</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.score != null ? lead.score : "Not scored"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Lead type</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.lead_type || "Not set"}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Status</strong>{" "}
              <select
                value={leadStatus || "new"}
                onChange={(e) => setLeadStatus(e.target.value)}
                style={{
                  fontSize: 13,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="qualified">Qualified</option>
                <option value="booked">Booked</option>
                <option value="not_fit">Not a fit</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Next step</strong>{" "}
              <span style={{ color: "#555" }}>
                {lead.follow_up_next_step ||
                  "Ask for guest capacity and budget range."}
              </span>
            </div>
          </div>

          {/* editable block */}
          <div
            style={{
              borderRadius: 10,
              border: "1px solid #e3e3e3",
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Next step
              </label>
              <input
                type="text"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  fontSize: 14,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
                placeholder="Ask for guest capacity and budget range."
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Internal notes
              </label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 8,
                  fontSize: 14,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  resize: "vertical",
                }}
                placeholder="Internal notes for you and the team, not visible to vendors."
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  fontSize: 14,
                  cursor: isSaving ? "default" : "pointer",
                  backgroundColor: "#183F34",
                  color: "#fff",
                }}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid #cc4444",
                  fontSize: 14,
                  cursor: deleting ? "default" : "pointer",
                  backgroundColor: "#ffffff",
                  color: "#cc4444",
                }}
              >
                {deleting ? "Deleting..." : "Delete lead"}
              </button>

              {(saveMessage || deleteMessage) && (
                <span
                  style={{
                    fontSize: 12,
                    color:
                      deleteMessage &&
                      !deleteMessage.toLowerCase().startsWith("lead deleted")
                        ? "#b00020"
                        : saveMessage === "Saved"
                        ? "#047857"
                        : deleteMessage
                        ? "#047857"
                        : "#b00020",
                  }}
                >
                  {deleteMessage || saveMessage}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
