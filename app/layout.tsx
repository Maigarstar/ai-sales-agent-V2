import type { Metadata } from "next";
import { Geist, Geist_Mono, Gilda_Display } from "next/font/google";
import "./globals.css";

/* Core fonts */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Loaded but not applied globally */
const gilda = Gilda_Display({
  variable: "--font-gilda-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "5 Star Wedding Concierge",
  description: "Your personal AI assistant for couples, venues and vendors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${gilda.variable} /* loaded, but unused unless called */
          antialiased bg-gray-50 dark:bg-gray-950
        `}
      >
        {children}
      </body>
    </html>
  );
}
