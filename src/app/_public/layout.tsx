import "./public.css";
import type { ReactNode } from "react";
import PublicHeader from "./PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--pubPageBg)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        <PublicHeader />

        <div style={{ marginTop: 32 }}>
          {children}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --pubPageBg: #fdfcfb;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --pubPageBg: #070707;
          }
        }
      `}</style>
    </div>
  );
}
