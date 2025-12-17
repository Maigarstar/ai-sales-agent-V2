"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const saved = localStorage.getItem("cookieConsent");
    if (!saved) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved state in case they reopen it
      try {
        const parsed = JSON.parse(saved);
        setAnalytics(parsed.analytics);
        setMarketing(parsed.marketing);
      } catch (e) {
        console.error("Error parsing cookie consent", e);
      }
    }
  }, []);

  const savePreferences = (acceptAll: boolean) => {
    const payload = {
      analytics: acceptAll ? true : analytics,
      marketing: acceptAll ? true : marketing,
      accepted: true,
      timestamp: Date.now(),
    };

    localStorage.setItem("cookieConsent", JSON.stringify(payload));
    
    if (acceptAll) {
      setAnalytics(true);
      setMarketing(true);
    }

    setShowBanner(false);
    setShowModal(false);
  };

  // If neither are visible, render nothing (or render a hidden trigger if you prefer)
  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* ==================== 
          1. BOTTOM BANNER 
         ==================== */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 w-full z-[9999] flex justify-center px-4 pb-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              We use cookies to enhance your experience and analyse site traffic. By continuing, you agree to our use of cookies. Read our{" "}
              <a
                href="https://5starweddingdirectory.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1F4D3E] underline decoration-[#1F4D3E]/30 hover:decoration-[#1F4D3E] transition-all"
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex gap-3 whitespace-nowrap">
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-full text-sm font-medium transition-all"
              >
                Preferences
              </button>
              <button
                onClick={() => savePreferences(true)}
                className="px-6 py-2.5 bg-[#1F4D3E] text-white rounded-full text-sm font-medium hover:bg-[#163C30] shadow-md hover:shadow-lg transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 
          2. PREFERENCES MODAL 
         ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[10000] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Close Button (SVG) */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header */}
            <h2 className="text-2xl font-serif text-[#1F4D3E] mb-2">
              Cookie Preferences
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Manage your privacy settings below. Essential cookies are always active to ensure the website functions correctly.
            </p>

            <div className="divide-y divide-gray-100 border-t border-b border-gray-100 mb-6">
              
              {/* Option 1: Strictly Necessary */}
              <div className="py-4 flex items-center justify-between">
                <div className="pr-4">
                  <h3 className="font-medium text-gray-900 text-sm">Strictly Necessary</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Required for security and core functionality.</p>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-400 border border-gray-200">
                  Always On
                </span>
              </div>

              {/* Option 2: Analytics */}
              <div className="py-4 flex items-center justify-between">
                <div className="pr-4">
                  <h3 className="font-medium text-gray-900 text-sm">Analytics</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Help us improve our site performance.</p>
                </div>
                {/* iOS Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F4D3E]"></div>
                </label>
              </div>

              {/* Option 3: Marketing */}
              <div className="py-4 flex items-center justify-between">
                <div className="pr-4">
                  <h3 className="font-medium text-gray-900 text-sm">Marketing</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Tailored content and advertising.</p>
                </div>
                {/* iOS Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F4D3E]"></div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => savePreferences(false)}
                className="px-5 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => savePreferences(true)}
                className="px-6 py-2 bg-[#1F4D3E] text-white rounded-lg text-sm font-medium hover:bg-[#163C30] shadow-md hover:shadow-lg transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}