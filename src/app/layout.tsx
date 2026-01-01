import type { Metadata } from "next";
import { Inter, Gilda_Display } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/context/ThemeProvider";
import { CookieProvider } from "@/app/components/cookies/CookieContext";

import "./globals.css";

/* =========================
   FONTS
========================= */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const gilda = Gilda_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gilda",
});

/* =========================
   METADATA
========================= */
export const metadata: Metadata = {
  title: {
    default: "5 Star Weddings",
    template: "%s | 5 Star Weddings",
  },
  description:
    "Luxury wedding intelligence, partnerships, and concierge services.",
};

/* =========================
   ROOT LAYOUT
========================= */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --bg-sidebar: #2D312F;
            --bg-main: #FDFCFB;
            --text-primary: #112620;
            --aura-gold: #C5A059;
            --border: rgba(0,0,0,0.05);
          }

          [data-theme='dark'] {
            --bg-sidebar: #1A1C1B;
            --bg-main: #0C1110;
            --text-primary: #E0E7E5;
            --aura-gold: #C5A059;
            --border: rgba(255,255,255,0.05);
          }

          body {
            background-color: var(--bg-main);
            color: var(--text-primary);
            margin: 0;
            font-family: var(--font-inter), sans-serif;
            transition: background-color 0.3s, color 0.3s;
          }

          .luxury-serif {
            font-family: var(--font-gilda), serif;
          }
        `}</style>
      </head>

      <body className={`${inter.variable} ${gilda.variable}`} data-app="core">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NXSBQEWCZT"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NXSBQEWCZT', { anonymize_ip: true });
            `,
          }}
        />

        <ThemeProvider>
          <CookieProvider>
            {children}
          </CookieProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
