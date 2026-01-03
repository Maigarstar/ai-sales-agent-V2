"use client";

import Link from "next/link";

const GOLD = "#c6a157";

export default function SignupLandingPage() {
  return (
    <div className="signupLandingWrap" style={wrap}>
      <main style={main}>
        <header style={header}>
          <div style={brandWrap}>
            <div style={brandTop}>5 STAR WEDDINGS</div>
            <div style={brandSub}>Concierge Platform</div>
          </div>

          <h1 style={heroTitle}>A calmer way to plan, a smarter way to host</h1>
          <p style={heroSub}>
            Couples get clarity, curated options, and a guided path. Partners get qualified enquiries,
            elevated visibility, and a platform built for premium conversion.
          </p>

          <div style={heroActions}>
            <Link href="/signup/couples" style={primaryCta}>
              Sign up as a couple
            </Link>
            <Link href="/signup/business" style={secondaryCta}>
              Sign up as a business
            </Link>
            <Link href="/login" style={textLink}>
              Already a member, sign in
            </Link>
          </div>
        </header>

        <section style={grid}>
          <div style={card}>
            <div style={cardKicker}>For couples</div>
            <h2 style={cardTitle}>From decision fatigue to confident choices</h2>
            <p style={cardText}>
              Tell us what matters, style, budget, location, vibe, and Aura helps you shortlist with
              purpose. Less scrolling, more certainty.
            </p>

            <ul style={list}>
              <li style={li}>Curated venues and trusted vendors</li>
              <li style={li}>Guided questions that reveal what you actually want</li>
              <li style={li}>Save favourites, compare, and move forward fast</li>
            </ul>

            <div style={cardActions}>
              <Link href="/signup/couples" style={cardBtn}>
                Create couples account
              </Link>
              <Link href="/vision" style={cardLink}>
                Explore the Vision space
              </Link>
            </div>
          </div>

          <div style={card}>
            <div style={cardKicker}>For businesses</div>
            <h2 style={cardTitle}>Premium positioning, real enquiries</h2>
            <p style={cardText}>
              Join a curated environment designed to attract couples who value quality, service,
              and experience. Built to turn interest into conversations.
            </p>

            <ul style={list}>
              <li style={li}>Qualified lead capture with context</li>
              <li style={li}>Brand forward presentation, not bargain listings</li>
              <li style={li}>Tools that support follow up and conversion</li>
            </ul>

            <div style={cardActions}>
              <Link href="/signup/business" style={cardBtn}>
                Create business account
              </Link>
              <Link href="/vendor-apply" style={cardLink}>
                Apply for inclusion
              </Link>
            </div>
          </div>
        </section>

        <section style={finePrintWrap}>
          <div style={finePrint}>
            No spam, no selling your data. Just a refined experience built for modern wedding decisions.
          </div>
        </section>

        <footer style={footer}>
          © 2026 5 Star Weddings, Concierge Platform. Powered by Taigenic.ai ·{" "}
          <Link href="/cookie-preferences" style={footerLink}>
            Cookie Preferences
          </Link>
        </footer>
      </main>

      <div className="signupLandingImage" style={imageSide} aria-hidden="true">
        <div style={imageOverlay}>
          <div style={imageText}>
            <div style={imageEyebrow}>AURA CURATION</div>
            <div style={imageHeadline}>One conversation, then everything sharpens</div>
            <div style={imageSub}>
              The platform that brings premium venues, planners, and couples into the same elegant flow.
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --pageBg: #ffffff;
          --pageText: #121212;
          --muted: rgba(18, 18, 18, 0.68);
          --muted2: rgba(18, 18, 18, 0.52);
          --border: rgba(0, 0, 0, 0.10);
          --panel: rgba(255, 255, 255, 0.92);
          --btnBg: #183f34;
          --btnText: #ffffff;
          --btnAltBg: transparent;
          --btnAltText: #121212;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --pageBg: #0b0b0b;
            --pageText: rgba(242, 242, 242, 0.94);
            --muted: rgba(242, 242, 242, 0.74);
            --muted2: rgba(242, 242, 242, 0.56);
            --border: rgba(242, 242, 242, 0.14);
            --panel: rgba(255, 255, 255, 0.04);
            --btnBg: rgba(242, 242, 242, 0.92);
            --btnText: #0b0b0b;
            --btnAltBg: transparent;
            --btnAltText: rgba(242, 242, 242, 0.92);
          }
        }

        .signupLandingWrap {
          background: var(--pageBg);
          color: var(--pageText);
        }

        @media (max-width: 980px) {
          .signupLandingWrap {
            grid-template-columns: 1fr !important;
          }
          .signupLandingImage {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const wrap = {
  display: "grid",
  gridTemplateColumns: "1.15fr 0.85fr",
  minHeight: "100vh",
  fontFamily: "'Nunito Sans', sans-serif",
  background: "var(--pageBg)",
  color: "var(--pageText)",
} as const;

const main = {
  padding: "74px 74px 54px",
  maxWidth: 980,
} as const;

const header = {
  maxWidth: 820,
  marginBottom: 34,
} as const;

const brandWrap = {
  textAlign: "left" as const,
  marginBottom: 22,
} as const;

const brandTop = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  letterSpacing: "0.2px",
} as const;

const brandSub = {
  marginTop: 6,
  fontSize: 12,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  fontWeight: 800,
  color: GOLD,
} as const;

const heroTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 46,
  lineHeight: 1.05,
  margin: "16px 0 14px",
} as const;

const heroSub = {
  fontSize: 15.5,
  lineHeight: 1.65,
  color: "var(--muted)",
  marginBottom: 22,
  maxWidth: 760,
} as const;

const heroActions = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: 12,
  marginTop: 10,
} as const;

const primaryCta = {
  textDecoration: "none",
  borderRadius: 14,
  padding: "12px 16px",
  border: "1px solid var(--border)",
  background: "var(--btnBg)",
  color: "var(--btnText)",
  fontWeight: 900,
  fontSize: 14,
} as const;

const secondaryCta = {
  textDecoration: "none",
  borderRadius: 14,
  padding: "12px 16px",
  border: "1px solid var(--border)",
  background: "var(--btnAltBg)",
  color: "var(--btnAltText)",
  fontWeight: 900,
  fontSize: 14,
} as const;

const textLink = {
  textDecoration: "none",
  color: "var(--muted)",
  fontWeight: 800,
  fontSize: 13,
  padding: "10px 4px",
} as const;

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginTop: 26,
} as const;

const card = {
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: "20px 20px 18px",
  background: "var(--panel)",
  backdropFilter: "blur(10px)",
} as const;

const cardKicker = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "var(--muted)",
  marginBottom: 10,
} as const;

const cardTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 24,
  margin: "0 0 10px",
} as const;

const cardText = {
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--muted)",
  marginBottom: 14,
} as const;

const list = {
  margin: 0,
  paddingLeft: 18,
  color: "var(--muted)",
  lineHeight: 1.7,
  fontSize: 13.5,
} as const;

const li = {
  marginBottom: 8,
} as const;

const cardActions = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 12,
  marginTop: 16,
  alignItems: "center",
} as const;

const cardBtn = {
  textDecoration: "none",
  borderRadius: 14,
  padding: "11px 14px",
  border: "1px solid var(--border)",
  background: "var(--btnBg)",
  color: "var(--btnText)",
  fontWeight: 900,
  fontSize: 13,
} as const;

const cardLink = {
  textDecoration: "none",
  color: "var(--pageText)",
  fontWeight: 900,
  fontSize: 13,
  opacity: 0.9,
} as const;

const finePrintWrap = {
  marginTop: 18,
} as const;

const finePrint = {
  border: "1px dashed var(--border)",
  borderRadius: 16,
  padding: "14px 16px",
  color: "var(--muted)",
  fontSize: 13,
  lineHeight: 1.6,
  maxWidth: 820,
} as const;

const footer = {
  marginTop: 26,
  fontSize: 11,
  color: "var(--muted2)",
} as const;

const footerLink = {
  color: "var(--pageText)",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 11,
} as const;

const imageSide = {
  position: "relative" as const,
  backgroundImage:
    "url(https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

const imageOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
  display: "flex",
  alignItems: "flex-end",
  padding: 56,
} as const;

const imageText = {
  color: "#fff",
  maxWidth: 420,
} as const;

const imageEyebrow = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.85)",
  marginBottom: 10,
} as const;

const imageHeadline = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  lineHeight: 1.08,
  marginBottom: 10,
} as const;

const imageSub = {
  fontSize: 14.5,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.84)",
} as const;
