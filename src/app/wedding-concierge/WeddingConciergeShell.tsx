"use client";

import { useState } from "react";
import ConciergeSidebar from "./components/ConciergeSidebar";
import ConciergeTopBar from "./components/ConciergeTopBar";
import ConciergeFooter from "./components/ConciergeFooter";

export default function WeddingConciergeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white text-[#112620]">
      <ConciergeSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ConciergeTopBar onToggleSidebar={() => setSidebarOpen(v => !v)} />

        <main className="min-h-0 flex-1">{children}</main>

        <ConciergeFooter />
      </div>
    </div>
  );
}