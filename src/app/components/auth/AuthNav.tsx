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

  return (
    <div style={wrap}>
      <div style={left}>
        <button
          type="button"
          onClick={() => router.back()}
          style={backBtn}
          aria-label="Back"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <Link href={backHref} style={ghostLink}>
          {showHome ? (
            <>
              <Home size={16} />
              Home
            </>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 18,
} as const;

const left = { display: "flex", alignItems: "center", gap: 12 } as const;

const backBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--pageText)",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} as const;

const ghostLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  border: "1px solid var(--border)",
  color: "var(--pageText)",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 800,
} as const;
