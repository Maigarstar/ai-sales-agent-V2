"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StartSessionResponse =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

function clean(v: string) {
  return v.trim();
}

function StartFormInner() {
  const router = useRouter();

  const [who, setWho] = useState<"vendor" | "couple">("vendor");
  const isVendor = who === "vendor";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [weddingDate, setWeddingDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canStart = useMemo(() => {
    if (submitting) return false;
    if (!clean(name) && !clean(email) && !clean(phone)) return false;
    return true;
  }, [submitting, name, email, phone]);

  async function handleStart() {
    setStatus(null);

    if (!canStart) {
      setStatus("Please add at least one contact detail.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        user_type: who,
        contact_name: clean(name) || null,
        contact_email: clean(email) || null,
        contact_phone: clean(phone) || null,
        contact_company: clean(company) || null,
        website: isVendor ? clean(website) || null : null,
        wedding_date: !isVendor ? weddingDate || null : null,
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

      setStatus("Saved, opening chat now.");

      // If you only use one chat page, keep "/chat"
      // If you have a vendor chat route, set it to "/vendors-chat"
      const chatPath = "/chat";
      router.push(`${chatPath}?conversationId=${conversationId}`);
    } catch (e: any) {
      setStatus(`Could not start: ${e?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
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
          maxWidth: 520,
          background: "#fff",
          borderRadius: 28,
          padding: 26,
          boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
          border: "1px solid rgba(24,63,52,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Gilda Display, serif",
            fontSize: 38,
            color: "#183F34",
            marginTop: 6,
            marginBottom: 10,
          }}
        >
          Wedding Concierge
        </h1>

        <p style={{ textAlign: "center", color: "#555", marginTop: 0 }}>
          Please tell us a bit about yourself to start.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              border: "1px solid #d9d1c6",
              borderRadius: 999,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <button
              type="button"
              onClick={() => setWho("vendor")}
              style={{
                padding: "10px 16px",
                border: "none",
                cursor: "pointer",
                background: isVendor ? "#183F34" : "transparent",
                color: isVendor ? "#fff" : "#666",
                fontSize: 14,
                minWidth: 160,
              }}
            >
              I am a Vendor
            </button>

            <button
              type="button"
              onClick={() => setWho("couple")}
              style={{
                padding: "10px 16px",
                border: "none",
                cursor: "pointer",
                background: !isVendor ? "#183F34" : "transparent",
                color: !isVendor ? "#fff" : "#666",
                fontSize: 14,
                minWidth: 160,
              }}
            >
              I am a Couple
            </button>
          </div>
        </div>

        {status && (
          <div
            style={{
              background: status.startsWith("Could not") ? "#ffebee" : "#e8f5e9",
              color: status.startsWith("Could not") ? "#c62828" : "#2e7d32",
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 14,
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 13,
            }}
          >
            {status}
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 14 }}>
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
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              style={inputStyle}
            />
          </div>

          {isVendor ? (
            <div>
              <label style={labelStyle}>Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="For example 5starweddings.com"
                style={inputStyle}
              />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Wedding Date</label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Company or Venue Name</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company or Venue Name"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={!canStart}
          style={{
            marginTop: 18,
            width: "100%",
            border: "none",
            borderRadius: 12,
            padding: "14px 18px",
            fontSize: 15,
            cursor: canStart ? "pointer" : "default",
            backgroundColor: canStart ? "#183F34" : "#9bb5ad",
            color: "#fff",
          }}
        >
          {submitting ? "Starting..." : "Start Chatting"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StartFormInner />
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
  borderRadius: 12,
  border: "1px solid #d9d1c6",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
