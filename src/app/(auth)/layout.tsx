// src/app/(auth)/layout.tsx

import type { ReactNode } from "react";
import AuthNav from "@/app/components/auth/AuthNav";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Overlay nav, does not push layout, does not affect right image */}
      <div
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 24px)",
          left: 0,
          right: 0,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            pointerEvents: "auto",
          }}
        >
          <AuthNav backHref="/vision" />
        </div>
      </div>

      {/* No paddingTop here, so nothing gets pushed down */}
      {children}
    </div>
  );
}
