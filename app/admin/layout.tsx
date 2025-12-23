"use client";

import React, { useState, useMemo } from "react";
import { AdminNav } from "./AdminNav";
import { TopNav } from "./TopNav";

/**
 * ✅ FINAL LUXURY ADMIN LAYOUT
 * Harmonised palette: Boutique Ivory background with warmer sidebar/footer
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const palette = useMemo(
    () =>
      theme === "light"
        ? {
            bg: "#FAF7F6",      // Boutique Ivory
            sidebar: "#F7F5F3", // Slightly warmer ivory (fix)
            surface: "#FFFFFF",
            text: "#18342E",
            accent: "#A58A32",
            border: "rgba(0,0,0,0.04)",
            footer: "#F7F5F3",  // Match sidebar
          }
        : {
            bg: "#0C1110",
            sidebar: "#1A1C1B",
            surface: "#1B1D1C",
            text: "#E0E7E5",
            accent: "#C5A059",
            border: "rgba(255,255,255,0.08)",
            footer: "#141615",
          },
    [theme]
  );

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: palette.bg,
        minHeight: "100vh",
        color: palette.text,
        overflow: "hidden",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarOpen ? 280 : 80,
          backgroundColor: palette.sidebar,
          borderRight: `1px solid ${palette.border}`,
          transition: "width 0.3s ease, background-color 0.3s ease",
          zIndex: 100,
        }}
      >
        <AdminNav open={sidebarOpen} setOpen={setSidebarOpen} palette={palette} />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          paddingLeft: sidebarOpen ? 280 : 80,
          transition: "padding-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          backgroundColor: palette.bg,
        }}
      >
        <TopNav
          theme={theme}
          onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
          palette={palette}
        />

        <main style={{ flex: 1, padding: "40px", backgroundColor: palette.bg }}>
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: "24px 40px",
            backgroundColor: palette.footer,
            borderTop: `1px solid ${palette.border}`,
            textAlign: "center",
            fontSize: "11px",
            letterSpacing: "1px",
            transition: "background-color 0.3s ease",
          }}
        >
          © 2025 5 STAR WEDDINGS — CONCIERGE PLATFORM. POWERED BY{" "}
          <strong style={{ color: palette.accent }}>TAIGENIC AI</strong>
        </footer>
      </div>
    </div>
  );
}
