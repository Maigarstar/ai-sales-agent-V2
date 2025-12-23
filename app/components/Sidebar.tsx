"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Settings
} from "lucide-react";

export function AdminNav({ open, setOpen }: any) {
  const pathname = usePathname();

  // Updated Brand Palette with #e7e6e2
  const brandPalette = {
    sidebar: "#e7e6e2",  // Your specific navbar color
    border: "#dcdbd7",   // Muted companion border
    text: "#18342e",     // Corporate Green
    accent: "#a58a32"    // Elite Gold
  };

  return (
    <aside style={{ 
      width: open ? 280 : 80, 
      backgroundColor: brandPalette.sidebar, 
      borderRight: `1px solid ${brandPalette.border}`, 
      height: "100vh", 
      position: "fixed", 
      left: 0,
      top: 0,
      zIndex: 100,
      transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "'Nunito Sans', sans-serif"
    }}>
      {/* Brand Identity Header */}
      <div style={{ padding: "40px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {open && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ 
              fontFamily: "'Gilda Display', serif", 
              fontSize: "16px", 
              letterSpacing: "3px", 
              color: brandPalette.text 
            }}>5 STAR WEDDINGS</span>
            <span style={{ 
              fontSize: "9px", 
              letterSpacing: "1.2px", 
              color: brandPalette.accent, 
              fontWeight: 800,
              marginTop: "4px"
            }}>THE LUXURY COLLECTION</span>
          </div>
        )}
        <button 
          onClick={() => setOpen(!open)} 
          style={{ background: "none", border: "none", cursor: "pointer", color: brandPalette.text, opacity: 0.6 }}
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Corporate Green Navigation */}
      <nav style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label="Overview" open={open} palette={brandPalette} active={pathname === "/admin"} />
        <NavItem href="/admin/leads" icon={<Users size={18} />} label="Neural Leads" open={open} palette={brandPalette} active={pathname === "/admin/leads"} />
        <NavItem href="/admin/live-chat" icon={<MessageSquare size={18} />} label="Aura Conversations" open={open} palette={brandPalette} active={pathname === "/admin/live-chat"} />
        <NavItem href="/admin/settings" icon={<Settings size={18} />} label="Network Settings" open={open} palette={brandPalette} active={pathname === "/admin/settings"} />
      </nav>

      {/* Signature Seal Footer */}
      {open && (
        <div style={{ position: "absolute", bottom: "32px", left: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "32px", height: "32px", backgroundColor: brandPalette.text, color: brandPalette.accent, 
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", 
            fontFamily: "'Gilda Display', serif", fontWeight: 900 
          }}>5</div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: brandPalette.accent, letterSpacing: "1px" }}>est. 2026</div>
            <div style={{ fontSize: "8px", color: brandPalette.text, opacity: 0.4, fontWeight: 700 }}>TAIGENIC AI</div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ href, icon, label, open, palette, active }: any) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: "16px", padding: "14px 16px", borderRadius: "10px", textDecoration: "none",
      backgroundColor: active ? "rgba(24, 52, 46, 0.05)" : "transparent",
      color: palette.text,
      justifyContent: open ? "flex-start" : "center",
      transition: "all 0.2s ease"
    }}>
      <span style={{ color: active ? palette.accent : palette.text, display: "flex" }}>{icon}</span>
      {open && <span style={{ fontSize: "13px", fontWeight: active ? 800 : 500, letterSpacing: "0.3px" }}>{label}</span>}
    </Link>
  );
}