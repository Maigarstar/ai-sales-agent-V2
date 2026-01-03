// src/app/components/auth/AuthNav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function AuthNav({
  backHref = "/vision",
  showHome = true,
}: {
  backHref?: string;
  showHome?: boolean;
}) {
  const router = useRouter();

  const onBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      router.push(backHref);
    } catch {
      router.push(backHref);
    }
  };

  return (
    <div style={wrap}>
      <button type="button" onClick={onBack} style={pillBtn} aria-label="Back">
        <ArrowLeft size={16} />
        <span style={label}>Back</span>
      </button>

      {showHome ? (
        <Link href={backHref} style={pillLink} aria-label="Home">
          <Home size={16} />
          <span style={label}>Home</span>
        </Link>
      ) : null}
    </div>
  );
}

const wrap = {
  display: "flex",
  alignItems: "center",
  gap: 12,
} as const;

const sharedPill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 16px",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.86)",
  color: "var(--pageText, #121212)",
  fontFamily: "var(--font-nunito)",
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: "0.01em",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
} as const;

const pillBtn = {
  ...sharedPill,
  cursor: "pointer",
} as const;

const pillLink = {
  ...sharedPill,
  textDecoration: "none",
} as const;

const label = {
  fontWeight: 500,
} as const;
