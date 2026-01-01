"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCookies } from "./CookieContext";

export default function CookieModal() {
  const {
    open,
    acceptAnalytics,
    rejectAnalytics,
  } = useCookies();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  if (!open) return null;

  function close() {
    setVisible(false);
  }

  function acceptAll() {
    acceptAnalytics();
    close();
  }

  function rejectNonEssential() {
    rejectAnalytics();
    close();
  }

  return (
    <div style={overlay}>
      <div
        style={{
          ...bar,
          transform: visible ? "translateY(0)" : "translateY(120%)",
        }}
      >
        <div style={content}>
          <div style={text}>
            <strong className="luxury-serif" style={title}>
              Cookie preferences
            </strong>
            <p style={desc}>
              We use cookies to operate the platform securely and understand how
              our concierge service is used. You can accept analytics or reject
              non-essential cookies.
            </p>
          </div>

          <div style={actions}>
            <button style={ghostBtn} onClick={rejectNonEssential}>
              Reject non-essential
            </button>

            <button style={primaryBtn} onClick={acceptAll}>
              Accept analytics
            </button>
          </div>
        </div>

        <button
          onClick={close}
          style={closeBtn}
          aria-label="Close cookie banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const overlay = {
  position: "fixed" as const,
  inset: 0,
  pointerEvents: "none" as const,
  zIndex: 9999,
};

const bar = {
  position: "fixed" as const,
  left: "50%",
  bottom: 24,
  transform: "translateX(-50%)",
  width: "calc(100% - 32px)",
  maxWidth: 820,
  backgroundColor: "#ffffff",
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  padding: 20,
  transition: "transform 0.3s ease",
  pointerEvents: "auto" as const,
};

const content = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
};

const text = {
  maxWidth: 560,
};

const title = {
  fontSize: 16,
  display: "block",
  marginBottom: 6,
  color: "#112620",
};

const desc = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "#666",
};

const actions = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap" as const,
};

const primaryBtn = {
  padding: "10px 18px",
  backgroundColor: "#112620",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "10px 18px",
  background: "transparent",
  color: "#112620",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const closeBtn = {
  position: "absolute" as const,
  top: 12,
  right: 12,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#999",
};
