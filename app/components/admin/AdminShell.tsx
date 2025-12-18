"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function AdminShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: any;
}) {
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => setOpen((prev) => !prev);
  const closeDropdown = () => setOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      <nav className="bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex items-center justify-between relative z-10">
        {/* LEFT MENU */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/admin"
            className="font-serif text-xl text-[#1F4D3E]"
          >
            Aura Admin
          </Link>
          <Link
            href="/dashboard/admin/moderation"
            className="text-sm font-bold text-gray-600 hover:text-[#1F4D3E]"
          >
            Moderation
          </Link>
          <Link
            href="/dashboard/admin/transactions"
            className="text-sm font-bold text-gray-600 hover:text-[#1F4D3E]"
          >
            Coin Ledger
          </Link>
          <Link
            href="/dashboard/admin/vendors"
            className="text-sm font-bold text-gray-600 hover:text-[#1F4D3E]"
          >
            Vendors
          </Link>
          <Link
            href="/dashboard/admin/analytics"
            className="text-sm font-bold text-gray-600 hover:text-[#1F4D3E]"
          >
            Analytics
          </Link>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-[#1F4D3E] transition-all"
          >
            👑 {profile?.full_name || "Admin"}
            <ChevronDown
              size={16}
              className={`transition-transform ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {open && (
            <div
              onMouseLeave={closeDropdown}
              className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 animate-fadeIn"
            >
              <Link
                href="/dashboard/admin/profile"
                onClick={closeDropdown}
                className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1F4D3E] transition-all"
              >
                View Profile
              </Link>
              <Link
                href="/dashboard/admin/settings"
                onClick={closeDropdown}
                className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1F4D3E] transition-all"
              >
                Settings
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
