"use client";

import { useEffect, useMemo, useState } from "react";

type Prefs = {
  necessary: true;          // always true
  analytics: boolean;
  marketing: boolean;
  consentedAt?: string;
};

function readPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem("cookiePrefs");
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

function writePrefs(p: Prefs) {
  try {
    localStorage.setItem("cookiePrefs", JSON.stringify({ ...p, consentedAt: new Date().toISOString() }));
  } catch {}
}

export default function CookiePreferences({ privacyUrl = "https://5starweddingdirectory.com/privacy" }: { privacyUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Load saved prefs once
  useEffect(() => {
    const saved = readPrefs();
    if (saved) {
      setAnalytics(!!saved.analytics);
      setMarketing(!!saved.marketing);
    }
  }, []);

  const saved = useMemo(() => readPrefs(), []);
  const showTopBar = !saved; // only show the slim bar until the user sets prefs

  const saveAndClose = () => {
    writePrefs({ necessary: true, analytics, marketing });
    setOpen(false);
  };

  return (
    <>
      {/* Top slim info bar (never overlaps footer) */}
      {showTopBar && (
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mt-0 bg-[#f7f7f7] text-gray-700 text-[13px] py-2 px-3 rounded-b-md shadow-sm flex items-center justify-between">
              <span>We use cookies. See <button onClick={() => setOpen(true)} className="underline text-gray-900 hover:text-black">Cookie Preferences</button>.</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-center-title"
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-6"
            style={{ fontFamily: "var(--font-nunito-sans), ui-sans-serif, system-ui" }}
          >
            <div className="flex items-start justify-between">
              <h2 id="cookie-center-title" className="text-xl font-semibold text-gray-900">Cookie Preference Center</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              We store and retrieve information from your device to improve experience and measure performance. You can change your choices at any time. Learn more in our{" "}
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-[#1F4D3E] underline">
                Privacy Policy
              </a>.
            </p>

            {/* Categories */}
            <div className="mt-6 space-y-5">
              <section className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Strictly Necessary Cookies (always active)</h3>
                  <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">On</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Required for security, basic functions, and support. This setting cannot be turned off.
                </p>
              </section>

              <section className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                    />
                    <span className={`w-10 h-5 rounded-full transition ${analytics ? "bg-[#1F4D3E]" : "bg-gray-300"}`}>
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition ${analytics ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </span>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Helps us understand visits and improve performance.
                </p>
              </section>

              <section className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Marketing Performance Cookies</h3>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                    />
                    <span className={`w-10 h-5 rounded-full transition ${marketing ? "bg-[#1F4D3E]" : "bg-gray-300"}`}>
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition ${marketing ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </span>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Measures the effectiveness of our campaigns.
                </p>
              </section>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <a
                href={privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 underline"
              >
                Privacy Policy
              </a>
              <button
                onClick={() => {
                  setAnalytics(false);
                  setMarketing(false);
                  saveAndClose();
                }}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Essential Only
              </button>
              <button
                onClick={() => {
                  setAnalytics(true);
                  setMarketing(true);
                  saveAndClose();
                }}
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
              >
                Accept All
              </button>
              <button
                onClick={saveAndClose}
                className="text-sm px-4 py-2 bg-[#1F4D3E] text-white rounded-lg hover:bg-[#163C30]"
              >
                Save Choices
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
