"use client";

import { useState } from "react";
import CookieModal from "./CookieModal"; // The pop-up component

export default function PublicFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer style={footerStyle}>
      <div style={contentStyle}>
        <span>Powered by Taigenic.ai</span>
        <span style={dividerStyle}>•</span>
        <span>5 Star Weddings Ltd. 2006 2025</span>
        <span style={dividerStyle}>•</span>
        <span>
          See{" "}
          <button onClick={() => setIsModalOpen(true)} style={cookieBtn}>
            Cookie Preferences
          </button>
        </span>
      </div>

      <CookieModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
}

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
  flexWrap: "wrap" as "wrap",
  justifyContent: "center",
};

const dividerStyle = { color: "#ccc", margin: "0 4px" };

const cookieBtn = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "12px",
  color: "#888",
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: "inherit",
};