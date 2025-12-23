"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 800,
        color: active ? "#183F34" : "#111827",
        background: active ? "#ffffff" : "transparent",
        border: active ? "1px solid #e5e7eb" : "1px solid transparent",
        display: "block",
      }}
    >
      {label}
    </Link>
  );
}

export default function DashboardNav() {
  const pathname = usePathname();

  const onboarded =
    typeof window !== "undefined" &&
    window.localStorage.getItem("taigenic_vendor_onboarded") === "true";

  const statusColor = onboarded ? "#065f46" : "#92400e";

  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid #e5e7eb",
        background: "#f6f7f8",
        padding: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 900, color: "#111827" }}>
          Taigenic dashboard
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: statusColor }}>
          {onboarded ? "Onboarding complete" : "Onboarding needed"}
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <NavLink
          href="/dashboard"
          label="Overview"
          active={isActive(pathname, "/dashboard")}
        />
        <NavLink
          href="/vendors-chat"
          label="Aura chat"
          active={isActive(pathname, "/vendors-chat")}
        />
        <NavLink
          href="/dashboard/profile"
          label="Business profile"
          active={isActive(pathname, "/dashboard/profile")}
        />
        <NavLink
          href="/dashboard/settings"
          label="Preferences"
          active={isActive(pathname, "/dashboard/settings")}
        />
        <NavLink
          href="/vendors/onboarding"
          label="Vendor onboarding"
          active={isActive(pathname, "/vendors/onboarding")}
        />
      </div>

      {pathname === "/dashboard" && !onboarded ? (
        <div
          style={{
            marginTop: 14,
            borderRadius: 16,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            padding: 12,
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.5,
          }}
        >
          Complete vendor onboarding to activate your workspace and improve lead
          quality.
          <div style={{ marginTop: 10 }}>
            <Link
              href="/vendors/onboarding"
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "#183F34",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: 13,
                display: "inline-block",
              }}
            >
              Start onboarding
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
