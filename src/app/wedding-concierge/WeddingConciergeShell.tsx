"use client";

import React from "react";

export default function WeddingConciergeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // We remove the 'flex', 'bg-white', and 'h-screen' constraints 
  // so the Chat Client can define the layout.
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}