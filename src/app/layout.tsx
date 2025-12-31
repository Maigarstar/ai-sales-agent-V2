import type { Metadata } from "next";
import { Inter, Gilda_Display } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import { CookieProvider } from "./components/cookies/CookieContext";
import CookieModal from "./components/cookies/CookieModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const gilda = Gilda_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gilda",
});

export const metadata: Metadata = {
  title: {
    default: "5 Star Weddings",
    template: "%s | 5 Star Weddings",
  },
  description:
    "Luxury wedding intelligence, partnerships, and concierge services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* THEME + TYPOGRAPHY */}
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

        {/* GOOGLE ANALYTICS */}
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
                anonymize_ip: true
              });
            `,
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${gilda.variable}`}
        data-app="core"
      >
        <ThemeProvider>
          <CookieProvider>
            {children}
            <CookieModal />
          </CookieProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
