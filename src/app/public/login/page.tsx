"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock } from "lucide-react";

const GOLD = "#c6a157";

function safeNext(next: string | null) {
  if (!next) return "/vision";
  if (!next.startsWith("/")) return "/vision";
  if (next.startsWith("//")) return "/vision";
  return next;
}

export default function PublicLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const next = safeNext(searchParams.get("next"));
      router.push(next);
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
          Continue your conversations, saved matches, and recommendations.
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

          <div style={links}>
            <Link href="/public/forgot-password" style={link}>
              Forgot your password
            </Link>
            <Link href="/cookie-preferences" style={linkMuted}>
              Cookie Preferences
            </Link>
          </div>

          <div style={dividerRow}>
            <div style={dividerLine} />
            <div style={dividerText}>New here</div>
            <div style={dividerLine} />
          </div>

          <div style={ctaRow}>
            <Link href="/public/signup" style={ctaBtn}>
              Couples signup
            </Link>
            <Link href="/signup/business" style={ctaBtn}>
              Business signup
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
            <h3 style={imageTitle}>Your wedding, beautifully guided</h3>
            <p style={imageSubtitle}>
              One conversation. Exceptional venues. Trusted vendors.
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
};

const left = {
  padding: "80px 90px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
};

const right = {
  backgroundImage:
    "url(https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative" as const,
};

const imageOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.50))",
  display: "flex",
  alignItems: "flex-end",
  padding: "60px",
};

const imageText = { color: "#fff", maxWidth: 420 };

const imageTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  marginBottom: 12,
};

const imageSubtitle = { fontSize: 15, opacity: 0.9 };

const brandWrap = { textAlign: "center" as const, marginBottom: 50 };

const brandTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 44,
  marginBottom: 6,
};

const brandSub = {
  fontSize: 13,
  color: GOLD,
  fontWeight: 800,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
  marginBottom: 10,
};

const subtitle = { fontSize: 15, color: "var(--muted)", marginBottom: 36 };

const form = { display: "flex", flexDirection: "column" as const, gap: 18 };

const field = {
  display: "flex",
  alignItems: "center",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "14px 16px",
  gap: 10,
  background: "var(--fieldBg)",
};

const fieldIcon = { color: "var(--icon)" };

const input = {
  border: "none",
  outline: "none",
  fontSize: 14,
  width: "100%",
  background: "transparent",
  color: "var(--pageText)",
};

const errorBox = {
  border: "1px solid rgba(210, 60, 60, 0.35)",
  background: "rgba(210, 60, 60, 0.10)",
  color: "var(--pageText)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  lineHeight: 1.4,
};

const primaryBtn = {
  marginTop: 8,
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
  marginTop: 8,
  display: "flex",
  justifyContent: "center",
  gap: 26,
  flexWrap: "wrap" as const,
};

const link = {
  fontSize: 13,
  color: "var(--pageText)",
  textDecoration: "none",
  fontWeight: 700,
};

const linkMuted = {
  fontSize: 13,
  color: "var(--muted2)",
  textDecoration: "none",
  fontWeight: 700,
};

const dividerRow = {
  marginTop: 12,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const dividerLine = {
  flex: 1,
  height: 1,
  background: "var(--border)",
  opacity: 0.7,
};

const dividerText = {
  fontSize: 12,
  color: "var(--muted2)",
  fontWeight: 800,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const ctaRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 6,
};

const ctaBtn = {
  textAlign: "center" as const,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  textDecoration: "none",
  color: "var(--pageText)",
  fontWeight: 800,
  fontSize: 14,
  background: "transparent",
};

const footer = {
  marginTop: 60,
  fontSize: 11,
  color: "var(--muted2)",
  textAlign: "center" as const,
};

const cookieLink = {
  color: "var(--pageText)",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 700,
};
