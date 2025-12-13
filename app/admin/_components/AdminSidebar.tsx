"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import { 
  MessageSquare, 
  Users, 
  BarChart2, 
  Settings,
  Trash2,
  Mail,             // new icon for Email Marketing
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/admin", icon: BarChart2 },
  { name: "Vendor Leads", href: "/admin/leads", icon: Users },
  { name: "AI Conversations", href: "/admin/chat", icon: MessageSquare },

  // NEW EMAIL MARKETING MENU ITEM
  { name: "Email Marketing", href: "/admin/email", icon: Mail },

  // Chat Feed with delete options
  { name: "Delete Chat", href: "/admin/vendor-chat-feed", icon: Trash2 },

  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[#EAE7E2] flex flex-col justify-between">
      <div>
        <Brand />

        <nav className="mt-6 px-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                  ${active 
                    ? "bg-[#183F34] text-white shadow-sm" 
                    : "text-[#183F34]/80 hover:bg-[#F1EFEA]"
                  }
                `}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 text-[11px] text-right text-[#183F34]/60">
        Powered by <span className="font-semibold text-[#C8A165]">Taigenic</span>
      </div>
    </aside>
  );
}
