// app/vendors-chat/layout.tsx

import React from "react";

export const metadata = {
  title: "Vendors Chat",
  description: "AI Vendor Qualification Assistant",
};

export default function VendorsChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20 }}>
      {children}
    </div>
  );
}
