// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Gilda_Display } from "next/font/google";
import "./globals.css";

/* Fonts */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const gilda = Gilda_Display({ variable: "--font-gilda-display", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "5 Star Wedding Concierge",
  description: "Your personal AI assistant for couples, venues and vendors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 1) Google Consent Mode v2 defaults. Must run before anything else */}
        <Script id="consent-defaults" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('consent', 'default', {
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              ad_storage: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });
          `}
        </Script>

        {/* 2) Helper to read your saved preferences and update Consent Mode,
              then dispatch a custom event so widgets can decide to load */}
        <Script id="consent-sync" strategy="beforeInteractive">
          {`
            window.__fswApplyConsentFromLocalStorage = function(){
              try {
                const raw = localStorage.getItem('fsw_cookie_consent');
                if(!raw) return;
                const prefs = JSON.parse(raw);
                const analytics = !!prefs.analytics;
                const marketing = !!prefs.marketing;
                gtag('consent', 'update', {
                  analytics_storage: analytics ? 'granted' : 'denied',
                  ad_storage: marketing ? 'granted' : 'denied',
                  ad_user_data: marketing ? 'granted' : 'denied',
                  ad_personalization: marketing ? 'granted' : 'denied'
                });
                document.dispatchEvent(new CustomEvent('fsw-consent-updated', { detail: { analytics, marketing }}));
              } catch(e){}
            };
            // Apply immediately on first paint
            window.__fswApplyConsentFromLocalStorage();
            // Also listen for updates from your Cookie Preference Center
            document.addEventListener('fsw-consent-updated', () => {
              // no op, just ensures listeners are wired
            });
            // If your modal saves to localStorage elsewhere, reflect changes
            window.addEventListener('storage', (e) => {
              if (e.key === 'fsw_cookie_consent') window.__fswApplyConsentFromLocalStorage();
            });
          `}
        </Script>

        {/* 3) Google Analytics loader (safe, respects Consent Mode). Replace G-XXXXXXX */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" strategy="afterInteractive" />
        <Script id="ga-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
          `}
        </Script>

        {/* 4) Statcounter and ProvideSupport, lazy and consent aware.
              They will attach only after consent is granted. Replace IDs. */}
        <Script id="fsw-consented-widgets" strategy="afterInteractive">
          {`
            (function(){
              var loaded = { statcounter: false, providesupport: false };

              function loadScript(src){
                var s = document.createElement('script');
                s.src = src; s.async = true;
                document.head.appendChild(s);
              }

              function loadProvideSupport(){
                if (loaded.providesupport) return;
                loaded.providesupport = true;
                // ProvideSupport widget
                // Replace with your account and widget code
                (function(){
                  var ps = document.createElement('script');
                  ps.type = 'text/javascript'; ps.async = true;
                  ps.src = 'https://image.providesupport.com/js/YOUR_ACCOUNT_CODE/safe-standard.js?ps_h=YOUR_WIDGET_HASH';
                  document.body.appendChild(ps);
                })();
              }

              function loadStatcounter(){
                if (loaded.statcounter) return;
                loaded.statcounter = true;
                // Statcounter classic install. Replace project and security values
                window.sc_project = YOUR_SC_PROJECT_ID;       // number
                window.sc_invisible = 1;
                window.sc_security = "YOUR_SC_SECURITY";
                loadScript('https://www.statcounter.com/counter/counter.js');
              }

              function maybeLoad(detail){
                // Treat analytics for Statcounter, marketing or functionality for ProvideSupport
                if (detail && detail.analytics) loadStatcounter();
                if (detail && (detail.marketing || true)) loadProvideSupport(); // set to true if you treat chat as essential functionality
              }

              // Try once using current preferences
              try{
                var raw = localStorage.getItem('fsw_cookie_consent');
                if (raw) { maybeLoad(JSON.parse(raw)); }
              } catch(e){}

              // React to future consent changes
              document.addEventListener('fsw-consent-updated', function(e){
                maybeLoad(e.detail || {});
              });
            })();
          `}
        </Script>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} ${gilda.variable} antialiased bg-gray-50 dark:bg-gray-950`}>
        {children}
      </body>
    </html>
  );
}
