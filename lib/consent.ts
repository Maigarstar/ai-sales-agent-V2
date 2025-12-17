// lib/consent.ts
export type CookiePrefs = {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

const KEY = "fsw_cookie_consent";

export function getConsent(): CookiePrefs | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) as CookiePrefs : null;
  } catch {
    return null;
  }
}

export function setConsent(prefs: CookiePrefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  // Inform GA Consent Mode if present
  if ((window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
      ad_storage: prefs.marketing ? "granted" : "denied",
    });
  }
  // Inform listeners
  window.dispatchEvent(new CustomEvent("fsw:consent-updated", { detail: prefs }));
}

// Load an external script tag once
export function loadScriptOnce(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}
