"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  MessageSquare,
  Users,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { useCookies } from "@/app/components/cookies/CookieContext";
import CookieModal from "@/app/components/cookies/CookieModal";

export function UserNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useCookies();

  const [isOpen, setIsOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /* -----------------------------
     THEME
  ------------------------------ */
  useEffect(() => {
    const saved = (localStorage.getItem("fsw-theme") as "light" | "dark") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fsw-theme", next);
  };

  /* -----------------------------
     LOGOUT
  ------------------------------ */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav
        style={{
          width: isOpen ? "280px" : "80px",
          backgroundColor: "var(--bg-sidebar)",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "100vh",
          position: "sticky",
          top: 0,
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
        }}
      >
        <button onClick={() => setIsOpen(!isOpen)} style={toggleBtn}>
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div
          style={{
            marginBottom: "50px",
            opacity: isOpen ? 1 : 0,
            transition: "0.2s",
          }}
        >
          <div
            className="luxury-serif"
            style={{ color: "var(--aura-gold)", fontSize: "18px" }}
          >
            5 STAR WEDDINGS
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "8px",
              letterSpacing: "2px",
            }}
          >
            CONCIERGE
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 6,
                textDecoration: "none",
                backgroundColor:
                  pathname === item.href ? "var(--aura-gold)" : "transparent",
                color:
                  pathname === item.href
                    ? "#112620"
                    : "rgba(255,255,255,0.6)",
                justifyContent: isOpen ? "flex-start" : "center",
              }}
            >
              <item.icon size={18} />
              {isOpen && (
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
          <button onClick={toggleTheme} style={utilBtn}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {isOpen && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>

          <button onClick={handleLogout} style={utilBtn}>
            <LogOut size={16} />
            {isOpen && <span>Sign Out</span>}
          </button>

          {isOpen && (
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <div style={{ color: "#FFF", fontSize: 10, opacity: 0.9 }}>
                Powered by Taigenic.ai
              </div>
              <div style={cookieLink}>Cookie Preferences</div>
            </div>
          )}
        </div>
      </nav>

      {/* Global cookie modal */}
      {open && <CookieModal />}
    </>
  );
}

/* ================= STYLES ================= */

const toggleBtn = {
  position: "absolute" as const,
  right: "-12px",
  top: "45px",
  width: "24px",
  height: "24px",
  backgroundColor: "var(--aura-gold)",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const utilBtn = {
  background: "none",
  border: "none",
  color: "#FFF",
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  fontSize: 13,
  padding: 10,
  width: "100%",
};

const cookieLink = {
  fontSize: "10px",
  textDecoration: "underline",
  cursor: "pointer",
  opacity: 0.6,
};

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutGrid },
  { name: "Aura Concierge", href: "/vendors-chat", icon: MessageSquare },
  { name: "Live Conversations", href: "/chat-live", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];
