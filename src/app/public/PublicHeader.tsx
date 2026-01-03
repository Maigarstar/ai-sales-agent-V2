"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname() || "/";

  const hide =
    pathname.startsWith("/public/login") ||
    pathname.startsWith("/public/signup") ||
    pathname.startsWith("/public/forgot-password") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/register");

  if (hide) return null;

  return (
    <>
      <div style={wrap}>
        <div style={brand}>AURA</div>

        <div style={actions}>
          <Link href="/public/login" style={signIn}>
            Sign In
          </Link>

          <Link href="/vendor-apply" style={cta}>
            Join as Vendor
          </Link>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --pubBg: #ffffff;
          --pubText: #121212;
          --pubBorder: rgba(0, 0, 0, 0.08);
          --pubGreen: #183f34;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --pubBg: rgba(255, 255, 255, 0.04);
            --pubText: rgba(242, 242, 242, 0.9);
            --pubBorder: rgba(242, 242, 242, 0.14);
            --pubGreen: #f2f2f2;
          }
        }
      `}</style>
    </>
  );
}

const wrap = {
  width: "100%",
  maxWidth: 1120,
  margin: "24px auto 0",
  padding: "14px 18px",
  borderRadius: 16,
  border: "1px solid var(--pubBorder)",
  background: "var(--pubBg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

const brand = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 20,
  color: "var(--pubGreen)",
} as const;

const actions = { display: "flex", alignItems: "center", gap: 16 } as const;

const signIn = {
  textDecoration: "none",
  color: "var(--pubText)",
  fontSize: 14,
  fontWeight: 700,
} as const;

const cta = {
  textDecoration: "none",
  background: "#183F34",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 800,
} as const;
