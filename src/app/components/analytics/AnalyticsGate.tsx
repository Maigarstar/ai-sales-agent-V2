"use client";

import { useEffect, useState } from "react";

export default function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === "all") {
      setAllowed(true);
    }
  }, []);

  if (!allowed) return null;

  return (
    <>
      {/* Google Analytics – gated by consent */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-NXSBQEWCZT"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NXSBQEWCZT', {
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
}
