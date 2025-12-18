"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Coins,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Moderation", href: "/dashboard/admin/moderation", icon: ShieldCheck },
    { name: "Coin Ledger", href: "/dashboard/admin/transactions", icon: Coins },
    { name: "Vendors", href: "/dashboard/admin/vendors", icon: Users },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 sticky top-0 h-screen shadow-sm">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 mb-10 text-[#1F4D3E]">
          <ShieldCheck size={22} />
          <span className="font-serif font-bold text-lg tracking-tight">
            Aura Admin
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#1F4D3E] text-white shadow-lg shadow-[#1F4D3E]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#1F4D3E]"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER / LOGOUT */}
      <div className="pt-6 border-t border-gray-50">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
