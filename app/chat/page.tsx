"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type StartSessionResponse =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

function clean(v: string) {
  return v.trim();
}

function ChatStartInner() {
  const searchParams = useSearchParams();

  const existingConversationId =
    searchParams.get("conversationId") ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("conversationId")
      : null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");

  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    existingConversationId
  );

  const canStart = useMemo(() => {
    if (!agree) return false;
    if (submitting) return false;
    if (!clean(name) && !clean(email) && !clean(phone)) return false;
    return true;
  }, [agree, submitting, name, email, phone]);

  async function handleStartSession() {
    setStatus(null);

    if (!canStart) {
      setStatus(
        "Please add at least one contact detail and confirm you are happy to be contacted."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        user_type: "planning",
        contact_name: clean(name) || null,
        contact_email: clean(email) || null,
        contact_phone: clean(phone) || null,
        contact_company: clean(company) || null,
        website: clean(website) || null,
      };

      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as
        | StartSessionResponse
        | null;

      if (!res.ok || !json || !json.ok || !("conversationId" in json)) {
        const msg =
          (json && "error" in json && json.error) ||
          `Start failed, status ${res.status}`;
        throw new Error(msg);
      }

      const id = json.conversationId;

      window.localStorage.setItem("conversationId", id);
      setConversationId(id);

      setStatus("Your concierge session is ready. You may begin.");
    } catch (e: any) {
      setStatus(
        `Could not start the session: ${e?.message || "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangeWhoIAm() {
    setStatus(null);
    try {
      window.localStorage.removeItem("conversationId");
    } catch {}
    setConversationId(null);
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setWebsite("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f4ef",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          background: "#fff",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
          border: "1px solid rgba(24,63,52,0.08)",
        }}
      >
        <button
          type="button"
          onClick={handleChangeWhoIAm}
          style={{
            borderRadius: 999,
            border: "1px solid #d9d1c6",
            background: "#fff",
            padding: "8px 14px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Change who I am
        </button>

        <h1
          style={{
            marginTop: 18,
            marginBottom: 10,
            fontFamily: '"Playfair Display","Gilda Display",serif',
            fontWeight: 400,
            fontSize: 42,
            color: "#111",
            letterSpacing: -0.6,
          }}
        >
          Shall we continue personally?
        </h1>

        <p style={{ marginTop: 0, color: "#555", fontSize: 15, lineHeight: 1.6 }}>
          A personal approach works best. Your details remain private and are
          used only for concierge support.
        </p>

        <div style={{ marginTop: 18 }}>
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div>
            <label style={labelStyle}>Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Company name</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Website, optional</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="For example kayonresort.com"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>
            I am happy to be contacted in relation to this enquiry
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 13, color: "#777" }}>
            Discreet, professional follow up only.
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            disabled={!canStart}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 14,
              cursor: canStart ? "pointer" : "default",
              backgroundColor: canStart ? "#183F34" : "#9bb5ad",
              color: "#fff",
              minWidth: 240,
            }}
          >
            {submitting ? "Starting…" : "Continue with concierge"}
          </button>
        </div>

        {status && (
          <div
            style={{
              marginTop: 14,
              fontSize: 13,
              color: status.startsWith("Could not") ? "#aa1111" : "#1c7a36",
            }}
          >
            {status}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 12, color: "#999", textAlign: "right" }}>
          Powered by Taigenic AI
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ChatStartInner />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  color: "#333",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 999,
  border: "1px solid #d9d1c6",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
