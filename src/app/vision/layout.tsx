// src/app/vision/layout.tsx
import type { Metadata } from "next";
import { Gilda_Display, Nunito_Sans } from "next/font/google";

const gilda = Gilda_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gilda",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vision Workspace | Taigenic AI",
  description:
    "An intelligent workspace where Aura and Atlas help couples and vendors connect, curate, and progress with precision.",
};

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${gilda.variable} ${nunito.variable} min-h-screen`}>
      {children}
    </div>
  );
}
