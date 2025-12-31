"use client";

import { useEffect, useState } from "react";
import { X, Shield, Cookie } from "lucide-react";

type ConsentState = {
  necessary: boolean;       // locked on true
  analytics: boolean;
  marketing: boolean;
};

const LS_KEY = "tlwc_cookie_consent_v1";

export default function CookiePrefsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Load saved prefs
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentState;
        setConsent({
          necessary: true,
          analytics: !!parsed.analytics,
          marketing: !!parsed.marketing,
        });
      }
    } catch {}
  }, [open]);

  function save(prefs: ConsentState) {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  }

  function handleAcceptAll() {
    const next = { necessary: true, analytics: true, marketing: true };
    setConsent(next);
    save(next);
    onClose();
  }

  function handleSave() {
    const next = { ...consent, necessary: true };
    setConsent(next);
    save(next);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Cookie size={18} className="text-[#183F34]" />
            <h3 className="text-[15px] font-semibold text-[#112620]">
              Cookie Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-500 hover:text-neutral-700"
            aria-label="Close cookie preferences"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5 text-[14px] text-neutral-700">
          <p>
            We use cookies to enhance your experience. You can manage your
            preferences below. Essential cookies are always active.
          </p>

          <div className="rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 p-4 border-b border-neutral-200">
              <Shield size={18} className="shrink-0 text-[#183F34]" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[14px] text-[#112620]">
                    Necessary
                  </strong>
                  <span className="text-xs text-neutral-500">Always on</span>
                </div>
                <p className="mt-1 text-[13px] text-neutral-600">
                  Required for site security, availability, and core features.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 border-b border-neutral-200 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={consent.analytics}
                onChange={(e) =>
                  setConsent((c) => ({ ...c, analytics: e.target.checked }))
                }
              />
              <div>
                <strong className="text-[14px] text-[#112620]">Analytics</strong>
                <p className="mt-1 text-[13px] text-neutral-600">
                  Helps us understand usage so we can refine your experience.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={consent.marketing}
                onChange={(e) =>
                  setConsent((c) => ({ ...c, marketing: e.target.checked }))
                }
              />
              <div>
                <strong className="text-[14px] text-[#112620]">Marketing</strong>
                <p className="mt-1 text-[13px] text-neutral-600">
                  Personalised content and partner offers relevant to weddings.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] rounded-full border border-neutral-300 text-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-[13px] rounded-full border border-[#183F34] text-white"
            style={{ backgroundColor: "#183F34" }}
          >
            Save preferences
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-[13px] rounded-full text-white"
            style={{ backgroundColor: "#183F34" }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}