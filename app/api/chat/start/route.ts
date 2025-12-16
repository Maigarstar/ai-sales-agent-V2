"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StartSessionResponse =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

function clean(v: string) {
  return v.trim();
}

export default function ChatPage() {
  const router = useRouter();
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

  const canStart = useMemo(() => {
    if (!agree) return false;
    if (submitting) return false;
    if (!clean(name) && !clean(email) && !clean(phone)) return false;
    return true;
  }, [agree, submitting, name, email, phone]);

  useEffect(() => {
    if (existingConversationId) {
      // If you already have a chat UI, you can render it here instead of redirecting.
      // This keeps the behaviour simple, always land on chat with conversationId.
      router.replace(`/chat?conversationId=${existingConversationId}`);
    }
  }, [existingConversationId, router]);

  async function handleStartSession() {
    setStatus(null);

    if (!canStart) {
      setStatus("Please add at least one contact detail, and tick the consent box.");
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

      const json = (await res.json().catch(() => null)) as StartSessionResponse | null;

      if (!res.ok || !json || !json.ok || !("conversationId" in json)) {
        const msg =
          (json && "error" in json && json.error) ||
          `Start failed, status ${res.status}`;
        throw new Error(msg);
      }

      const conversationId = json.conversationId;

      window.localStorage.setItem("conversationId", conversationId);

      setStatus("Saved, opening your concierge chat now.");

      router.push(`/chat?conversationId=${conversationId}`);
    } catch (e: any) {
      setStatus(`Could not start the session: ${e?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangeWhoIAm() {
    setStatus(null);
    try {
      window.localStorage.removeItem("conversationId");
    } catch {}
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
            fontSize: 44,
            color: "#111",
            letterSpacing: -0.6,
          }}
        >
          A few details before we start
        </h1>

        <p style={{ marginTop: 0, color: "#555", fontSize: 15, lineHeight: 1.6 }}>
          This keeps your concierge session personal, and lets us follow up in a professional way.
        </p>

        <div style={{ marginTop: 18 }}>
          <label style={{ display: "block", fontSize: 14, color: "#333", marginBottom: 6 }}>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 14, color: "#333", marginBottom: 6 }}>
            Email
          </label>
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
            <label style={{ display: "block", fontSize: 14, color: "#333", marginBottom: 6 }}>
              Phone number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, color: "#333", marginBottom: 6 }}>
              Company name
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 14, color: "#333", marginBottom: 6 }}>
            Website address (optional)
          </label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="For example kayonresort.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>
            I understand that all information I enter here will be stored on the website, but will
            not be publicly visible nor searchable, except for by the Administrators of the website.
            I understand that I may be contacted by the Administrator of the website.
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 13, color: "#777" }}>
            Your details are used only for concierge support and follow up, never shared publicly.
          </div>

          <button
            type="button"
            onClick={() => void handleStartSession()}
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
            {submitting ? "Starting..." : "Start my concierge session"}
          </button>
        </div>

        {status && (
          <div style={{ marginTop: 12, fontSize: 13, color: status.startsWith("Could not") ? "#aa1111" : "#1c7a36" }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: "#999", textAlign: "right" }}>
          Powered by Taigenic AI
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 999,
  border: "1px solid #d9d1c6",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
