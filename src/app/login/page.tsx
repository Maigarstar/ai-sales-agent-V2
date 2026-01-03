"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock } from "lucide-react";

const GOLD = "#c6a157";

function safeNextParam(v: string | null) {
  if (!v) return "";
  if (!v.startsWith("/")) return "";
  if (v.startsWith("//")) return "";
  return v;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = safeNextParam(searchParams.get("next"));

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    return createBrowserClient(url, anon);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured on this environment.");
      return;
    }

    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setBusy(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      if (nextParam) {
        router.push(nextParam);
        router.refresh();
        return;
      }

      let destination = "/admin/dashboard";

      try {
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id;

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

          if (profile?.role === "couple") destination = "/vision";
          if (profile?.role === "vendor" || profile?.role === "business") destination = "/admin/dashboard";
        }
      } catch {
        // silent, we already have a safe default
      }

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authWrapper" style={wrapper}>
      <div style={left}>
        <div style={brandWrap}>
          <h1 style={brandTitle}>5 STAR WEDDINGS</h1>
          <div style={brandSub}>Concierge Platform</div>
        </div>

        <h2 style={title}>Sign in</h2>
        <p style={subtitle}>
          Continue your conversations, saved matches, and curated introductions.
        </p>

        <form style={form} onSubmit={onSubmit}>
          <Field
            icon={<Mail size={14} />}
            placeholder="Email address"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            disabled={busy}
          />

          <Field
            icon={<Lock size={14} />}
            placeholder="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />

          {error ? <div style={errorBox}>{error}</div> : null}

          <button type="submit" style={primaryBtn} disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <div style={linksRow}>
            <Link href="/public/forgot-password" style={linkMuted}>
              Forgot password
            </Link>
            <Link href="/cookie-preferences" style={linkMuted}>
              Cookie preferences
            </Link>
          </div>

          <div style={dividerRow}>
            <div style={dividerLine} />
            <div style={dividerText}>New here</div>
            <div style={dividerLine} />
          </div>

          <div style={signupRow}>
            <Link href="/signup/couples" style={secondaryBtn}>
              Couples signup
            </Link>
            <Link href="/signup/business" style={secondaryBtn}>
              Business signup
            </Link>
          </div>
        </form>

        <div style={footer}>
          © 2026 5 Star Weddings. Powered by Taigenic.ai
        </div>
      </div>

      <div className="authImage" style={right}>
        <div style={imageOverlay}>
          <div style={imageText}>
            <div style={imagePill}>5 STAR WEDDINGS</div>
            <h3 style={imageTitle}>Your wedding, beautifully guided</h3>
            <p style={imageSubtitle}>
              One conversation. Exceptional venues. Trusted vendors.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --pageBg: #ffffff;
          --pageText: #121212;
          --muted: #5f5f5f;
          --muted2: #7a7a7a;
          --border: #d7d7d7;
          --icon: #2f2f2f;
          --fieldBg: transparent;
          --btnBg: #183f34;
          --btnText: #ffffff;
          --btnAltBg: rgba(0, 0, 0, 0.03);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --pageBg: #0b0b0b;
            --pageText: #f2f2f2;
            --muted: rgba(242, 242, 242, 0.78);
            --muted2: rgba(242, 242, 242, 0.6);
            --border: rgba(242, 242, 242, 0.16);
            --icon: rgba(242, 242, 242, 0.78);
            --fieldBg: rgba(255, 255, 255, 0.02);
            --btnBg: #f2f2f2;
            --btnText: #0b0b0b;
            --btnAltBg: rgba(255, 255, 255, 0.06);
          }
        }

        @media (max-width: 900px) {
          .authWrapper {
            grid-template-columns: 1fr !important;
          }
          .authImage {
            display: none !important;
          }
        }

        input::placeholder {
          color: var(--muted2);
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={field}>
      <span style={fieldIcon}>{icon}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        style={input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

/* STYLES */

const wrapper = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  minHeight: "100vh",
  fontFamily: "'Nunito Sans', sans-serif",
  background: "var(--pageBg)",
  color: "var(--pageText)",
} as const;

const left = {
  padding: "80px 90px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
} as const;

const right = {
  backgroundImage:
    "url(https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative" as const,
} as const;

const imageOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.52))",
  display: "flex",
  alignItems: "flex-end",
  padding: "60px",
} as const;

const imageText = { color: "#fff", maxWidth: 520 } as const;

const imagePill = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.20)",
  background: "rgba(0,0,0,0.28)",
  fontSize: 12,
  letterSpacing: "2px",
  fontWeight: 800,
  marginBottom: 16,
} as const;

const imageTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 38,
  marginBottom: 12,
  lineHeight: 1.08,
} as const;

const imageSubtitle = { fontSize: 15, opacity: 0.9, lineHeight: 1.5 } as const;

const brandWrap = { textAlign: "center" as const, marginBottom: 42 } as const;

const brandTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 44,
  marginBottom: 6,
} as const;

const brandSub = {
  fontSize: 13,
  color: GOLD,
  fontWeight: 800,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
} as const;

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
  marginBottom: 10,
} as const;

const subtitle = { fontSize: 15, color: "var(--muted)", marginBottom: 28 } as const;

const form = { display: "flex", flexDirection: "column" as const, gap: 18 } as const;

const field = {
  display: "flex",
  alignItems: "center",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "14px 16px",
  gap: 10,
  background: "var(--fieldBg)",
} as const;

const fieldIcon = { color: "var(--icon)" } as const;

const input = {
  border: "none",
  outline: "none",
  fontSize: 14,
  width: "100%",
  background: "transparent",
  color: "var(--pageText)",
} as const;

const errorBox = {
  border: "1px solid rgba(210, 60, 60, 0.35)",
  background: "rgba(210, 60, 60, 0.10)",
  color: "var(--pageText)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  lineHeight: 1.4,
} as const;

const primaryBtn = {
  marginTop: 6,
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--btnBg)",
  color: "var(--btnText)",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
} as const;

const linksRow = {
  marginTop: 6,
  display: "flex",
  justifyContent: "center",
  gap: 22,
  flexWrap: "wrap" as const,
} as const;

const linkMuted = {
  fontSize: 13,
  color: "var(--muted2)",
  textDecoration: "none",
  fontWeight: 700,
} as const;

const dividerRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: 14,
  marginTop: 16,
} as const;

const dividerLine = { height: 1, background: "var(--border)" } as const;

const dividerText = {
  fontSize: 12,
  color: "var(--muted2)",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  fontWeight: 800,
} as const;

const signupRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 8,
} as const;

const secondaryBtn = {
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--btnAltBg)",
  color: "var(--pageText)",
  fontWeight: 800,
  fontSize: 14,
} as const;

const footer = {
  marginTop: 56,
  fontSize: 11,
  color: "var(--muted2)",
  textAlign: "center" as const,
} as const;
