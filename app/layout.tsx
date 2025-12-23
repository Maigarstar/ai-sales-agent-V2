import type { Metadata } from "next";
import { Inter, Gilda_Display } from "next/font/google";
import { ThemeProvider } from "@/app/context/ThemeProvider"; // ✅ Add this line
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const gilda = Gilda_Display({ weight: "400", subsets: ["latin"], variable: "--font-gilda" });

export const metadata: Metadata = {
  title: "5 Star Weddings Concierge | Powered by Taigenic.ai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            transition: background-color .3s, color .3s;
          }
          .luxury-serif { font-family: var(--font-gilda), serif; }
        `}</style>
      </head>
      <body className={`${inter.variable} ${gilda.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
