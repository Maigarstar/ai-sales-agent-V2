// src/app/(auth)/layout.tsx

import type { ReactNode } from "react";
import AuthNav from "@/app/components/auth/AuthNav";

const APP_VERSION = "v1.01";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Floating top bar, does not push content, does not affect right image */}
      <div
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 16px)",
          left: 0,
          right: 0,
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            pointerEvents: "auto",
          }}
        >
          {/* Left controls moved inward */}
          <div
            style={{
              paddingLeft: "clamp(28px, 4.5vw, 72px)",
              paddingRight: "clamp(16px, 3vw, 32px)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <AuthNav backHref="/vision" />
          </div>

          {/* Taigenic lockup pinned to the far right (image side) */}
          <div
            style={{
              position: "absolute",
              top: 2,
              right: "clamp(16px, 2.8vw, 32px)",
              textAlign: "right",
              lineHeight: 1.1,
              pointerEvents: "none",
            }}
            aria-label="Taigenic brand"
          >
            <div
              style={{
                fontFamily: "var(--font-gilda)",
                letterSpacing: "0.14em",
                fontSize: 16,
                color: "#ffffff",
                textTransform: "uppercase",
                textShadow: "0 1px 12px rgba(0,0,0,0.35)",
              }}
            >
              TAIGENIC.AI
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: "var(--font-nunito)",
                fontSize: 12,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "0.08em",
                textShadow: "0 1px 12px rgba(0,0,0,0.35)",
              }}
            >
              {APP_VERSION}
            </div>
          </div>

          {/* Thin divider line (gold on dark, light grey on white) */}
          <div
            style={{
              marginTop: 14,
              height: 1,
              width: "100%",
              background:
                "linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.10), rgba(0,0,0,0))",
            }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
