"use client";

import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

export default function BusinessSignupPage() {
  return (
    <div style={wrapper}>
      {/* LEFT PANEL */}
      <div style={left}>
        {/* BRAND */}
        <div style={brandWrap}>
          <h1 style={brandTitle}>5 STAR WEDDINGS</h1>
          <div style={brandSub}>Concierge Platform</div>
        </div>

        <h2 style={title}>Create your business account</h2>
        <p style={subtitle}>
          Join our curated collection of wedding venues, planners, and luxury partners.
        </p>

        <form style={form}>
          <Field icon={<User size={14} />} placeholder="Business name" />
          <Field icon={<User size={14} />} placeholder="Primary contact name" />
          <Field icon={<Mail size={14} />} placeholder="Business email address" />
          <Field icon={<Lock size={14} />} placeholder="Password" type="password" />

          {/* reCAPTCHA placeholder */}
          <div style={recaptcha}>
            reCAPTCHA verification will appear here
          </div>

          <button type="submit" style={primaryBtn}>
            Create business account
          </button>

          <div style={links}>
            <Link href="/login" style={link}>
              Already a member? Sign in
            </Link>
            <Link href="/forgot-password" style={linkMuted}>
              Forgot your password
            </Link>
          </div>
        </form>

        {/* FOOTER */}
        <div style={footer}>
          © 2026 5 Star Weddings, Concierge Platform. Powered by Taigenic.ai ·{" "}
          <button style={cookieBtn}>Cookie Preferences</button>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div style={right}>
        <div style={imageOverlay}>
          <div style={imageText}>
            <h3 style={imageTitle}>Where exceptional weddings begin</h3>
            <p style={imageSubtitle}>
              Italian villas, timeless settings, and unforgettable celebrations.
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE */}
      <style jsx>{`
        @media (max-width: 900px) {
          .signup-wrapper {
            grid-template-columns: 1fr !important;
          }
          .signup-image {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ================= FIELD ================= */

function Field({ icon, placeholder, type = "text" }: any) {
  return (
    <div style={field}>
      <span style={fieldIcon}>{icon}</span>
      <input type={type} placeholder={placeholder} style={input} />
    </div>
  );
}

/* ================= STYLES ================= */

const wrapper = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  minHeight: "100vh",
  fontFamily: "'Nunito Sans', sans-serif",
};

const left = {
  padding: "80px 90px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
};

const right = {
  backgroundImage:
    "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative" as const,
};

const imageOverlay = {
  position: "absolute" as const,
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
  display: "flex",
  alignItems: "flex-end",
  padding: "60px",
};

const imageText = {
  color: "#fff",
  maxWidth: 420,
};

const imageTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  marginBottom: 12,
};

const imageSubtitle = {
  fontSize: 15,
  opacity: 0.9,
};

/* BRAND */

const brandWrap = {
  textAlign: "center" as const,
  marginBottom: 50,
};

const brandTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 44,
  marginBottom: 6,
};

const brandSub = {
  fontSize: 13,
  color: "#C5A059",
  fontWeight: 800,
  letterSpacing: "2px",
};

/* CONTENT */

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
  marginBottom: 10,
};

const subtitle = {
  fontSize: 15,
  color: "#666",
  marginBottom: 36,
};

const form = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 18,
};

const field = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #DDD",
  borderRadius: 12,
  padding: "14px 16px",
  gap: 10,
};

const fieldIcon = {
  color: "#999",
};

const input = {
  border: "none",
  outline: "none",
  fontSize: 14,
  width: "100%",
};

const recaptcha = {
  border: "1px dashed #DDD",
  borderRadius: 12,
  padding: "16px",
  fontSize: 12,
  color: "#777",
  textAlign: "center" as const,
};

const primaryBtn = {
  marginTop: 12,
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "#183F34",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const links = {
  marginTop: 24,
  display: "flex",
  justifyContent: "center",
  gap: 30,
};

const link = {
  fontSize: 13,
  color: "#183F34",
  textDecoration: "none",
  fontWeight: 600,
};

const linkMuted = {
  fontSize: 13,
  color: "#999",
  textDecoration: "none",
};

/* FOOTER */

const footer = {
  marginTop: 60,
  fontSize: 11,
  color: "#999",
  textAlign: "center" as const,
};

const cookieBtn = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#183F34",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
};
