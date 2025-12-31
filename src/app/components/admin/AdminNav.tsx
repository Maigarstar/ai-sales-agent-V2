"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/leads", label: "Vendor Leads" },
    { href: "/admin/live-chat", label: "Live Chat" },
    { href: "/admin/conversations", label: "Conversations" },
  ];

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        Aura <span style={{ fontWeight: 300, color: "#888" }}>Admin</span>
      </div>
      <div style={linksContainer}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                ...linkStyle,
                color: isActive ? "#fff" : "#183F34",
                backgroundColor: isActive ? "#183F34" : "transparent",
                border: isActive ? "1px solid #183F34" : "1px solid transparent",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* === Styles === */
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 40px",
  borderBottom: "1px solid #ddd",
  backgroundColor: "#fff",
};

const logoStyle = {
  fontFamily: "Gilda Display, serif",
  fontSize: "20px",
  fontWeight: 700,
  color: "#183F34",
};

const linksContainer = { display: "flex", gap: "16px" };

const linkStyle = {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "14px",
  textDecoration: "none",
  transition: "all 0.2s ease",
};
