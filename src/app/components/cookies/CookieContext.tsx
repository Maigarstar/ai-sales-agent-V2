"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CookieContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;

  analyticsAccepted: boolean;

  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
};

const CookieContext = createContext<CookieContextType | null>(null);

/* ---------- helpers ---------- */

function isEURegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz?.startsWith("Europe");
  } catch {
    return true; // fail safe = EU rules
  }
}

/* ---------- provider ---------- */

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("analytics_consent");

    if (stored === "true") {
      setAnalyticsAccepted(true);
    }

    if (stored === "false") {
      setAnalyticsAccepted(false);
    }

    // EU users must explicitly choose
    if (stored === null && isEURegion()) {
      setOpen(true);
    }

    // Non-EU default allow (can change later)
    if (stored === null && !isEURegion()) {
      setAnalyticsAccepted(true);
    }

    setHydrated(true);
  }, []);

  const acceptAnalytics = () => {
    localStorage.setItem("analytics_consent", "true");
    setAnalyticsAccepted(true);
    setOpen(false);

    // ready for server-side storage later
    // persistConsentServerSide(true);
  };

  const rejectAnalytics = () => {
    localStorage.setItem("analytics_consent", "false");
    setAnalyticsAccepted(false);
    setOpen(false);

    // ready for server-side storage later
    // persistConsentServerSide(false);
  };

  if (!hydrated) return null;

  return (
    <CookieContext.Provider
      value={{
        open,
        setOpen,
        analyticsAccepted,
        acceptAnalytics,
        rejectAnalytics,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

/* ---------- hook ---------- */

export function useCookies() {
  const ctx = useContext(CookieContext);
  if (!ctx) {
    throw new Error("useCookies must be used inside CookieProvider");
  }
  return ctx;
}
