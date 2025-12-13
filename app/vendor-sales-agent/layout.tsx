import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Vendor Sales Agent | 5 Star Weddings",
  description:
    "Share a little about your brand and let our AI concierge show you how 5 Star Weddings can support your growth.",
};

export default function VendorSalesAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
