// src/app/(auth)/reset-password/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Stage = "init" | "ready" | "missing" | "success";

function parseHashTokens() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash || "";
  if (!hash.startsWith("#")) return null;

  const params = new URLSearchParams(hash.slice(1));
  const access_token = params.get("access_token") || "";
  const refresh_token = params.get("refresh_token") || "";
  const type = params.get("type") || "";

  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token, type };
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [stage, setStage] = useState<Stage>("init");
  const [busy, setBusy] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setErr(null);
      setOk(null);

      try {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (!cancelled) {
              setStage("missing");
              setErr("This reset link is invalid or has expired, please request a new one.");
            }
            return;
          }

          try {
            url.searchParams.delete("code");
            window.history.replaceState({}, "", url.toString());
          } catch {}

          if (!cancelled) setStage("ready");
          return;
        }

        const tokens = parseHashTokens();
        if (tokens) {
          const { error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

          if (error) {
            if (!cancelled) {
              setStage("missing");
              setErr("This reset link is invalid or has expired, please request a new one.");
            }
            return;
          }

          try {
            window.history.replaceState({}, "", `${url.origin}${url.pathname}`);
          } catch {}

          if (!cancelled) setStage("ready");
          return;
        }

        if (!cancelled) {
          setStage("missing");
          setErr("Reset link missing, please request a new one.");
        }
      } catch {
        if (!cancelled) {
          setStage("missing");
          setErr("Unable to open reset link, please request a new one.");
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setErr(null);
    setOk(null);

    const p = String(password || "");
    const c = String(confirm || "");

    if (p.length < 8) {
      setErr("Please choose a password of at least 8 characters.");
      return;
    }
    if (p !== c) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: p });
      if (error) {
        setErr(error.message || "Unable to update password.");
        return;
      }

      setOk("Password updated, you can now sign in.");
      setStage("success");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setErr("Unable to update password.");
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
              Set a new password
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
              Choose a new password for your account.
            </div>
          </div>

          {stage === "init" ? (
            <div
              style={{
                marginTop: 18,
                fontFamily: "var(--font-nunito)",
                fontSize: 13,
                color: "rgba(0,0,0,0.70)",
              }}
            >
              Verifying your reset link.
            </div>
          ) : null}

          {stage === "missing" ? (
            <div style={{ marginTop: 18 }}>
              {err ? (
                <div
                  style={{
                    fontFamily: "var(--font-nunito)",
                    fontSize: 13,
                    color: "#8a2a2a",
                    lineHeight: 1.5,
                  }}
                >
                  {err}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 14,
                  fontFamily: "var(--font-nunito)",
                  fontSize: 13,
                }}
              >
                <Link
                  href="/forgot-password"
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                    color: "rgba(0,0,0,0.70)",
                  }}
                >
                  Request a new link
                </Link>

                <Link
                  href="/login"
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                    color: "rgba(0,0,0,0.70)",
                  }}
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : null}

          {stage === "ready" || stage === "success" ? (
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
                New password
              </label>

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
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

              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-nunito)",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.60)",
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Confirm password
              </label>

              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your new password"
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
                disabled={busy || stage === "success"}
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
                {busy ? "Updating" : stage === "success" ? "Done" : "Update password"}
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
                  Back to sign in
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
          ) : null}
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
