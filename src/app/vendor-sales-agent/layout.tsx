import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Sales Agent | 5 Star Weddings",
  description:
    "Share a little about your brand and let our AI concierge show you how 5 Star Weddings can bring you more high-value destination enquiries.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
