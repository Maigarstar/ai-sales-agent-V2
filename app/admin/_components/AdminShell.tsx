"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        
        {/* TOP NAV */}
        <Topbar />

        {/* PAGE CONTENT */}
        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
