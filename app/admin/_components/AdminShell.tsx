"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const nav = [
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/conversations", label: "Conversations" },
    { href: "/admin/vendor-applications", label: "Vendor applications" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // Pushes profile/logout to bottom
        }}
      >
        <div>
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
                    display: "block",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Section at Bottom */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: 18, display: "grid", gap: 8 }}>
          <Link
            href="/admin/profile"
            style={{
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #eee",
              background: pathname === "/admin/profile" ? "#183F34" : "#fff",
              color: pathname === "/admin/profile" ? "#fff" : "#183F34",
              fontSize: 14,
              display: "block",
            }}
          >
            My Profile
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #eee", // Matches your other buttons
              background: "#fff",
              color: "#d32f2f", // Red color for logout
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {isLoggingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </aside>

      <main style={{ padding: 18 }}>{children}</main>
    </div>
  );
}