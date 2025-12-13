"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const nav = [
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/conversations", label: "Conversations" },
    { href: "/admin/vendor-applications", label: "Vendor applications" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        background: "#f7f7f7",
      }}
    >
      <aside
        style={{
          padding: 18,
          background: "#ffffff",
          borderRight: "1px solid #eee",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: "Gilda Display, serif",
              fontSize: 18,
              color: "#183F34",
            }}
          >
            Taigenic Admin
          </div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
            Internal tools
          </div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: active ? "#183F34" : "#fff",
                  color: active ? "#fff" : "#183F34",
                  fontSize: 14,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ padding: 18 }}>{children}</main>
    </div>
  );
}
