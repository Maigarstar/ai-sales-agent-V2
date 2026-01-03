"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock, User, Calendar } from "lucide-react";

const GOLD = "#c6a157";

export default function CouplesSignupPage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    return createBrowserClient(url, anon);
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Supabase is not configured on this environment.");
      return;
    }

    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (!weddingDate) return setError("Please select your wedding date.");
    if (!password || password.length < 8) return setError("Password must be at least 8 characters.");

    setBusy(true);

    try {
      const emailRedirectTo = `${window.location.origin}/public/login`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo,
          data: {
            role: "couple",
            full_name: fullName.trim(),
            wedding_date: weddingDate,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const userId = data?.user?.id;

      if (userId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              role: "couple",
              full_name: fullName.trim(),
              contact_email: email.trim(),
              wedding_date: weddingDate,
              onboarding_completed: false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (profileError) {
          setError(profileError.message);
          return;
        }
      }

      setSuccess(
        "Account created. Please check your email to confirm, then sign in to continue."
      );

      setFullName("");
      setEmail("");
      setWeddingDate("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signupWrapper" style={wrapper}>
      {/* LEFT */}
      <div style={left}>
        <div style={brandWrap}>
          <h1 style={brandTitle}>5 STAR WEDDINGS</h1>
          <div style={brandSub}>Concierge Platform</div>
        </div>

        <h2 style={title}>Create your couples account</h2>
        <p style={subtitle}>
          Begin your journey with our wedding concierge and curated partners.
        </p>

        <form style={form} onSubmit={onSubmit}>
          <Field
            icon={<User size={14} />}
            placeholder="Full name"
            name="full_name"
            value={fullName}
            onChange={setFullName}
            disabled={busy}
          />

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
            icon={<Calendar size={14} />}
            placeholder="Wedding date"
            name="wedding_date"
            type="date"
            value={weddingDate}
            onChange={setWeddingDate}
            disabled={busy}
          />

          <Field
            icon={<Lock size={14} />}
            placeholder="Password (8+ characters)"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />

          <div style={recaptcha}>reCAPTCHA verification will appear here</div>

          <div style={privacyNote}>
            No data is sold or shared. Your details stay within 5 Star Weddings.
          </div>

          {error ? <div style={errorBox}>{error}</div> : null}
          {success ? <div style={successBox}>{success}</div> : null}

          <button type="submit" style={primaryBtn} disabled={busy}>
            {busy ? "Creating..." : "Create account"}
          </button>

          <div style={links}>
            <Link href="/public/login" style={link}>
              Already a member? Sign in
            </Link>
            <Link href="/public/forgot-password" style={linkMuted}>
              Forgot your password
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
      <div className="signupImage" style={right}>
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
          .signupWrapper {
            grid-template-columns: 1fr !important;
          }
          .signupImage {
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

const recaptcha = {
  border: "1px dashed var(--border)",
  borderRadius: 12,
  padding: "16px",
  fontSize: 12,
  color: "var(--muted2)",
  textAlign: "center" as const,
};

const privacyNote = {
  marginTop: 2,
  fontSize: 12,
  color: "var(--muted)",
  textAlign: "center" as const,
  lineHeight: 1.5,
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

const successBox = {
  border: "1px solid rgba(60, 180, 120, 0.35)",
  background: "rgba(60, 180, 120, 0.10)",
  color: "var(--pageText)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  lineHeight: 1.4,
};

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
