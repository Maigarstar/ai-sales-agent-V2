"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  const Item = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          textDecoration: "none",
          color: "#111",
          background: active ? "#f2f2f2" : "transparent",
          border: "1px solid #e8e8e8",
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Item href="/admin" label="Overview" />
      <Item href="/admin/vendors" label="Vendors" />
      <Item href="/admin/conversations" label="Conversations" />
      <Item href="/admin/applications" label="Applications" />
    </div>
  );
}
