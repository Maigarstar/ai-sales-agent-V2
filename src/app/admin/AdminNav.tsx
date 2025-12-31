"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  HeartHandshake,
  MessageSquare,
  BarChart2,
  ClipboardList,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function AdminNav({ open, setOpen }: any) {
  const pathname = usePathname();

  const palette = {
    sidebar: "#E7E6E2",
    border: "#DCDAD6",
    text: "#18342E",
    accent: "#C5A059",
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
                fontSize: 16,
                letterSpacing: 3,
                color: palette.text,
              }}
            >
              5 STAR WEDDINGS
            </div>
            <div
              style={{
                fontSize: 9,
                color: palette.accent,
                letterSpacing: 1,
                fontWeight: 800,
                marginTop: 4,
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

      {/* NAV */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "0 12px",
        }}
      >
        {/* OVERVIEW */}
        <NavItem
          href="/admin/dashboard"
          label="Overview"
          icon={<LayoutDashboard size={18} />}
          open={open}
          active={pathname === "/admin/dashboard"}
          palette={palette}
        />

        {/* PLATFORM */}
        <NavItem
          href="/admin/users"
          label="Users"
          icon={<Users size={18} />}
          open={open}
          active={pathname.startsWith("/admin/users")}
          palette={palette}
        />

        {/* SUPPLY */}
        <NavItem
          href="/admin/business"
          label="Business"
          icon={<Building2 size={18} />}
          open={open}
          active={pathname.startsWith("/admin/business")}
          palette={palette}
        />

        {/* DEMAND */}
        <NavItem
          href="/admin/couples"
          label="Couples"
          icon={<HeartHandshake size={18} />}
          open={open}
          active={pathname.startsWith("/admin/couples")}
          palette={palette}
        />

        <NavItem
          href="/admin/leads"
          label="Leads"
          icon={<ClipboardList size={18} />}
          open={open}
          active={pathname.startsWith("/admin/leads")}
          palette={palette}
        />

        {/* INTELLIGENCE */}
        <NavItem
          href="/admin/conversations"
          label="Conversations"
          icon={<MessageSquare size={18} />}
          open={open}
          active={pathname.startsWith("/admin/conversations")}
          palette={palette}
        />

        <NavItem
          href="/admin/insights"
          label="AI Insights"
          icon={<BarChart2 size={18} />}
          open={open}
          active={pathname.startsWith("/admin/insights")}
          palette={palette}
        />

        <NavItem
          href="/admin/audit"
          label="Audit Log"
          icon={<ShieldCheck size={18} />}
          open={open}
          active={pathname.startsWith("/admin/audit")}
          palette={palette}
        />

        {/* SETTINGS */}
        <NavItem
          href="/admin/settings"
          label="Settings"
          icon={<Settings size={18} />}
          open={open}
          active={pathname.startsWith("/admin/settings")}
          palette={palette}
        />
      </nav>

      {/* FOOTER */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 26,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              backgroundColor: palette.text,
              color: palette.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              fontFamily: "'Gilda Display', serif",
              fontWeight: 900,
            }}
          >
            5
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: palette.accent,
                letterSpacing: 1,
              }}
            >
              est. 2026
            </div>
            <div
              style={{
                fontSize: 8,
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

function NavItem({ href, icon, label, open, active, palette }: any) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "13px 14px",
        borderRadius: 10,
        textDecoration: "none",
        backgroundColor: active ? palette.hover : "transparent",
        color: active ? palette.accent : palette.text,
        justifyContent: open ? "flex-start" : "center",
        transition: "all 0.25s ease",
      }}
    >
      {icon}
      {open && (
        <span
          style={{
            fontSize: 13,
            fontWeight: active ? 700 : 500,
          }}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
