"use client";

import { useState } from "react";
import ConciergeSidebar from "./ConciergeSidebar";

export default function ConciergeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white text-[#112620]">
      {/* Sidebar, needs both open and onToggle */}
      <ConciergeSidebar open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar, no extra toggle here */}
        <header className="flex h-14 items-center border-b border-neutral-200 px-4">
          <div className="text-sm font-semibold tracking-wide">
            Wedding Concierge
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
