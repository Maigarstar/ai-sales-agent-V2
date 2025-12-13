"use client";

import { Menu } from "lucide-react";

export default function Topbar() {
  return (
    <header className="w-full h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700 flex items-center px-6 justify-between md:justify-end">
      
      {/* Mobile menu placeholder */}
      <button className="md:hidden">
        <Menu />
      </button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Admin</span>
      </div>
    </header>
  );
}
