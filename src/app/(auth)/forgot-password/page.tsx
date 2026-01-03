"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const clean = String(email || "").trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setErr("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(clean, {
        redirectTo,
      });

      if (error) {
        setErr(error.message || "Unable to send reset email.");
      } else {
        setOk("Check your inbox, your reset link is on the way.");
        setEmail("");
      }
    } catch {
      setErr("Unable to send reset email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-gilda)",
                fontSize: 28,
                letterSpacing: "0.02em",
                color: "var(--pageText, #121212)",
              }}
            >
              Forgot your password
            </div>

            <div
              style={{
                fontFamily: "var(--font-nunito)",
                fontSize: 14,
                color: "rgba(0,0,0,0.60)",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Enter your email and we will send a reset link.
            </div>
          </div>

          <form onSubmit={submit} style={{ marginTop: 18 }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-nunito)",
                fontSize: 12,
                color: "rgba(0,0,0,0.60)",
                marginBottom: 8,
              }}
            >
              Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@email.com"
              style={{
                width: "100%",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 16,
                padding: "14px 16px",
                fontFamily: "var(--font-nunito)",
                fontSize: 14,
                outline: "none",
                background: "rgba(255,255,255,0.92)",
              }}
            />

            {err ? (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-nunito)",
                  fontSize: 13,
                  color: "#8a2a2a",
                }}
              >
                {err}
              </div>
            ) : null}

            {ok ? (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-nunito)",
                  fontSize: 13,
                  color: "rgba(0,0,0,0.75)",
                }}
              >
                {ok}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 18,
                width: "100%",
                borderRadius: 999,
                padding: "12px 16px",
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#C5A059",
                color: "#111111",
                fontFamily: "var(--font-nunito)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.75 : 1,
              }}
            >
              {busy ? "Sending" : "Send reset link"}
            </button>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontFamily: "var(--font-nunito)",
                fontSize: 13,
              }}
            >
              <Link
                href="/login"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: 4,
                  color: "rgba(0,0,0,0.70)",
                }}
              >
                Back to login
              </Link>

              <Link
                href="/signup"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: 4,
                  color: "rgba(0,0,0,0.70)",
                }}
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div
        className="auth-right"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.40), rgba(0,0,0,0.65)), url(https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1600&q=80)",
        }}
      />
    </div>
  );
}
