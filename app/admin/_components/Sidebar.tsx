"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Users, 
  BarChart2, 
  Settings 
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/admin", icon: BarChart2 },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Chat", href: "/admin/chat", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 p-6 hidden md:block">
      <h1 className="text-xl font-bold mb-6">AI Sales Agent</h1>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded transition 
              ${active ? 
                "bg-primary text-white" : 
                "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
