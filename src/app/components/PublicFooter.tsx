"use client";

import { useCookies } from "@/app/components/cookies/CookieContext";
import CookieModal from "@/app/components/cookies/CookieModal";

export default function PublicFooter() {
  const { open } = useCookies();

  return (
    <>
      <footer style={footerStyle}>
        <div style={contentStyle}>
          <span>Powered by Taigenic.ai</span>
          <span style={dividerStyle}>•</span>
          <span>5 Star Weddings Ltd. 2006 2025</span>
          <span style={dividerStyle}>•</span>
          <span>Cookie Preferences</span>
        </div>
      </footer>

      {/* Global cookie banner */}
      {open && <CookieModal />}
    </>
  );
}

/* ===== STYLES ===== */

const footerStyle = {
  width: "100%",
  padding: "40px 20px",
  backgroundColor: "transparent",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const contentStyle = {
  fontSize: "12px",
  color: "#888",
  letterSpacing: "0.5px",
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
  justifyContent: "center",
};

const dividerStyle = {
  color: "#ccc",
  margin: "0 4px",
};
