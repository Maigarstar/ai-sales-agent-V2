// src/app/login/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const GOLD = "#c6a157";

function safeNextParam(p: string | null) {
  if (!p) return "";
  if (!p.startsWith("/")) return "";
  if (p.startsWith("//")) return "";
  return p;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => {
    try {
      return createBrowserSupabase();
    } catch {
      return null;
    }
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

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setBusy(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const userId = data?.user?.id;

      let role: string | null = null;

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        role = profile?.role ?? null;
      }

      const next = safeNextParam(searchParams.get("next"));

      if (next) {
        router.push(next);
      } else {
        router.push(role === "vendor" || role === "business" ? "/admin/dashboard" : "/vision");
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authWrapper" style={wrapper}>
      {/* LEFT */}
      <div style={left}>
        <div style={brandWrap}>
          <h1 style={brandTitle}>5 STAR WEDDINGS</h1>
          <div style={brandSub}>Concierge Platform</div>
        </div>

        <h2 style={title}>Sign in</h2>
        <p style={subtitle}>
          Continue with Aura, keep your shortlist, and request introductions to trusted vendors.
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

          <div style={privacyNote}>
            Private by design. No spam, no data selling.
          </div>

          {error ? <div style={errorBox}>{error}</div> : null}

          <button type="submit" style={primaryBtn} disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <div style={links}>
            <Link href="/forgot-password" style={linkMuted}>
              Forgot your password
            </Link>
            <Link href="/signup" style={link}>
              Create an account
            </Link>
          </div>
        </form>

        <div style={footer}>
          © 2026 5 Star Weddings, Concierge Platform. Powered by Taigenic.ai ·{" "}
          <Link href="/cookie-preferences" style={cookieLink}>
            Cookie Preferences
          </Link>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="authImage" style={right}>
        <div style={imageOverlay}>
          <div style={imageText}>
            <h3 style={imageTitle}>Your vision, saved and ready</h3>
            <p style={imageSubtitle}>
              Sign in to continue with Aura, keep your shortlist, and request introductions to trusted vendors.
            </p>
          </div>
        </div>
      </div>

      {/* RESPONSIVE + LIGHTS OUT */}
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
        autoComplete={name === "password" ? "current-password" : "email"}
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
  background: "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.50))",
  display: "flex",
  alignItems: "flex-end",
  padding: "60px",
} as const;

const imageText = { color: "#fff", maxWidth: 420 } as const;

const imageTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  marginBottom: 12,
} as const;

const imageSubtitle = { fontSize: 15, opacity: 0.9 } as const;

const brandWrap = { textAlign: "center" as const, marginBottom: 50 } as const;

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

const subtitle = { fontSize: 15, color: "var(--muted)", marginBottom: 36 } as const;

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

const privacyNote = {
  marginTop: 2,
  fontSize: 12,
  color: "var(--muted)",
  textAlign: "center" as const,
  lineHeight: 1.5,
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
  marginTop: 12,
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

const links = {
  marginTop: 24,
  display: "flex",
  justifyContent: "center",
  gap: 30,
  flexWrap: "wrap" as const,
} as const;

const link = {
  fontSize: 13,
  color: "var(--pageText)",
  textDecoration: "none",
  fontWeight: 700,
} as const;

const linkMuted = {
  fontSize: 13,
  color: "var(--muted2)",
  textDecoration: "none",
} as const;

const footer = {
  marginTop: 60,
  fontSize: 11,
  color: "var(--muted2)",
  textAlign: "center" as const,
} as const;

const cookieLink = {
  color: "var(--pageText)",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 700,
} as const;
