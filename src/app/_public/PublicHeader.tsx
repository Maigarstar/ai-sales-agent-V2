"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname() || "/";

  const hide =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/public/login" ||
    pathname === "/public/signup" ||
    pathname === "/public/forgot-password" ||
    pathname.startsWith("/signup/") ||
    pathname.startsWith("/register");

  if (hide) return null;

  return (
    <nav style={wrap}>
      <Link href="/" style={brand}>
        AURA
      </Link>

      <div style={actions}>
        <Link href="/login" style={signIn}>
          Sign In
        </Link>

        <Link href="/signup" style={cta}>
          Join as Vendor
        </Link>
      </div>
    </nav>
  );
}

const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 24px",
  border: "1px solid var(--pubBorder)",
  borderRadius: 16,
  background: "var(--pubNavBg)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
} as const;

const brand = {
  textDecoration: "none",
  color: "var(--pubGreen)",
  fontWeight: 700,
  fontSize: 20,
  fontFamily: "Gilda Display, serif",
  letterSpacing: "1px",
} as const;

const actions = {
  display: "flex",
  gap: 24,
  alignItems: "center",
} as const;

const signIn = {
  textDecoration: "none",
  color: "var(--pubMuted)",
  fontSize: 14,
  fontWeight: 700,
} as const;

const cta = {
  textDecoration: "none",
  color: "var(--pubCtaText)",
  backgroundColor: "#183F34",
  padding: "10px 20px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 800,
} as const;
