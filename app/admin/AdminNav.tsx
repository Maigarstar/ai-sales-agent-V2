"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart2,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * 5 STAR WEDDINGS — CONCIERGE ADMIN NAV
 * Elegant collapsible sidebar with gold edge, soft shadows, and green palette.
 */
export function AdminNav({ open, setOpen }: any) {
  const pathname = usePathname();

  const palette = {
    sidebar: "#E7E6E2", // soft ivory
    border: "#DCDAD6",
    text: "#18342E", // green
    accent: "#C5A059", // gold
    hover: "rgba(197,160,89,0.08)",
    shadow: "2px 0 10px rgba(0,0,0,0.04)",
  };

  return (
    <aside
      style={{
        width: open ? 280 : 84,
        backgroundColor: palette.sidebar,
        borderRight: `1px solid ${palette.border}`,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: "width 0.35s ease",
        boxShadow: palette.shadow,
        fontFamily: "'Nunito Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "38px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {open && (
          <div>
            <div
              style={{
                fontFamily: "'Gilda Display', serif",
                fontSize: "16px",
                letterSpacing: "3px",
                color: palette.text,
              }}
            >
              5 STAR WEDDINGS
            </div>
            <div
              style={{
                fontSize: "9px",
                color: palette.accent,
                letterSpacing: "1px",
                fontWeight: 800,
                marginTop: "4px",
              }}
            >
              THE LUXURY COLLECTION
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: palette.text,
            opacity: 0.6,
          }}
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "0 12px",
        }}
      >
        <NavItem
          href="/admin/dashboard"
          label="Overview"
          icon={<LayoutDashboard size={18} />}
          open={open}
          active={pathname === "/admin/dashboard"}
          palette={palette}
        />
        <NavItem
          href="/admin/dashboard/vendor-leads"
          label="Vendor Leads"
          icon={<Users size={18} />}
          open={open}
          active={pathname.startsWith("/admin/dashboard/vendor-leads")}
          palette={palette}
        />
        <NavItem
          href="/admin/dashboard/vendors-chat"
          label="Conversations"
          icon={<MessageSquare size={18} />}
          open={open}
          active={pathname.startsWith("/admin/dashboard/vendors-chat")}
          palette={palette}
        />
        <NavItem
          href="/admin/dashboard/live"
          label="Live Chat"
          icon={<Activity size={18} />}
          open={open}
          active={pathname.startsWith("/admin/dashboard/live")}
          palette={palette}
        />
        <NavItem
          href="/admin/dashboard/insights"
          label="AI Insights"
          icon={<BarChart2 size={18} />}
          open={open}
          active={pathname.startsWith("/admin/dashboard/insights")}
          palette={palette}
        />
        <NavItem
          href="/admin/dashboard/analytics"
          label="Analytics"
          icon={<Settings size={18} />}
          open={open}
          active={pathname.startsWith("/admin/dashboard/analytics")}
          palette={palette}
        />
      </nav>

      {/* FOOTER */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "26px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: palette.text,
              color: palette.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              fontFamily: "'Gilda Display', serif",
              fontWeight: 900,
            }}
          >
            5
          </div>
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: palette.accent,
                letterSpacing: "1px",
              }}
            >
              est. 2026
            </div>
            <div
              style={{
                fontSize: "8px",
                color: palette.text,
                opacity: 0.5,
                fontWeight: 700,
              }}
            >
              TAIGENIC AI
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* === SUB COMPONENT === */
function NavItem({ href, icon, label, open, active, palette }: any) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "13px 14px",
        borderRadius: "10px",
        textDecoration: "none",
        backgroundColor: active ? palette.hover : "transparent",
        color: active ? palette.accent : palette.text,
        justifyContent: open ? "flex-start" : "center",
        transition: "all 0.25s ease",
      }}
    >
      <span>{icon}</span>
      {open && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: active ? 700 : 500,
            color: active ? palette.accent : palette.text,
          }}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
