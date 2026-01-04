// src/app/share/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ArrowLeft, ShieldCheck } from "lucide-react";

type ShareMessage = { role: "user" | "assistant"; content: string };
type SharePayload = {
  v: number;
  createdAt: number;
  expiresAt: number;
  title?: string;
  chatType?: "business" | "couple";
  product?: string;
  messages: ShareMessage[];
};

const BRAND_GOLD = "#c6a157";

function fromB64x(b64x: string) {
  const b64 = b64x.replace(/\./g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const raw = atob(b64 + pad);
  return decodeURIComponent(
    Array.from(raw)
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function SharePage() {
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isExpired = useMemo(() => {
    if (!payload) return false;
    return Date.now() > Number(payload.expiresAt || 0);
  }, [payload]);

  useEffect(() => {
    try {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const token = hash.startsWith("#") ? hash.slice(1) : "";
      if (!token) {
        setError("This share link is missing data.");
        return;
      }

      const json = fromB64x(token);
      const parsed = JSON.parse(json) as SharePayload;

      if (!parsed?.messages || !Array.isArray(parsed.messages)) {
        setError("This share link is invalid.");
        return;
      }

      setPayload(parsed);
    } catch {
      setError("This share link is invalid.");
    }
  }, []);

  const copyTranscript = async () => {
    if (!payload) return;
    const text = payload.messages
      .map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "#070707",
        color: "white",
        fontFamily: "var(--font-nunito)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/vision"
            className="inline-flex items-center gap-2 text-[12px] opacity-90 hover:opacity-100"
            style={{ textDecoration: "none", color: "white" }}
          >
            <ArrowLeft size={16} />
            Back to Vision
          </Link>

          <div className="inline-flex items-center gap-2 text-[12px] opacity-80">
            <ShieldCheck size={16} style={{ color: BRAND_GOLD }} />
            View only link
          </div>
        </div>

        <div style={{ height: 1, background: `${BRAND_GOLD}55`, marginTop: 18 }} />

        <div className="mt-8">
          <div
            style={{
              fontFamily: "var(--font-gilda)",
              fontSize: 26,
              letterSpacing: "0.02em",
            }}
          >
            {payload?.title || "Shared Conversation"}
          </div>

          <div className="mt-2 text-[12px] opacity-70">
            {payload?.product || "Taigenic.ai"}
            {payload?.chatType ? ` · ${payload.chatType === "business" ? "Atlas" : "Aura"}` : ""}
          </div>

          {error ? (
            <div
              className="mt-8 rounded-2xl border p-5"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              {error}
            </div>
          ) : null}

          {payload && isExpired ? (
            <div
              className="mt-8 rounded-2xl border p-5"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              This share link has expired.
            </div>
          ) : null}

          {payload && !error && !isExpired ? (
            <>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={copyTranscript}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] border"
                  style={{
                    borderColor: "rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                  }}
                >
                  <Copy size={16} />
                  {copied ? "Copied" : "Copy transcript"}
                </button>
              </div>

              <div className="mt-10 space-y-6">
                {payload.messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[78%] rounded-[22px] border px-6 py-4"
                        style={{
                          borderColor: "rgba(255,255,255,0.12)",
                          background: isUser ? "rgba(24,63,52,0.95)" : "rgba(255,255,255,0.04)",
                          fontFamily: "var(--font-nunito)",
                          fontSize: 15,
                          lineHeight: 1.65,
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 text-[12px] opacity-60">
                This is view only. To continue the conversation, open Vision.
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
