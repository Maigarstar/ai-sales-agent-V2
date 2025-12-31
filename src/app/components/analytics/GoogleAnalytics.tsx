"use client";

import { useEffect } from "react";
import { useCookies } from "@/app/components/cookies/CookieContext";

const GA_ID = "G-NXSBQEWCZT";

export default function GoogleAnalytics() {
  const { analyticsAccepted } = useCookies();

  useEffect(() => {
    if (!analyticsAccepted) return;
    if (document.getElementById("ga-script")) return;

    // gtag.js
    const script = document.createElement("script");
    script.id = "ga-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // config
    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { anonymize_ip: true });
    `;
    document.head.appendChild(inline);
  }, [analyticsAccepted]);

  return null;
}
