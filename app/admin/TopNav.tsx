"use client";

import { Moon, Sun, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopNav({
  theme,
  onThemeToggle,
  palette,
}: {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  palette: any;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        borderBottom: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      <h1 style={{ fontFamily: "Gilda Display, serif", fontSize: 20, color: palette.text }}>
        Admin Dashboard
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          style={{
            background: "none",
            border: `1px solid ${palette.border}`,
            borderRadius: 6,
            padding: 6,
            cursor: "pointer",
          }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon size={18} color={palette.text} />
          ) : (
            <Sun size={18} color={palette.accent} />
          )}
        </button>

        {/* Profile avatar + dropdown */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <User size={18} />
            </div>
            <ChevronDown
              size={16}
              color={theme === "light" ? "#555" : "#ccc"}
              style={{ transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 48,
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border}`,
                borderRadius: 8,
                boxShadow:
                  theme === "light"
                    ? "0 4px 12px rgba(0,0,0,0.1)"
                    : "0 4px 12px rgba(0,0,0,0.3)",
                minWidth: 180,
                zIndex: 99,
              }}
            >
              <div style={{ padding: "10px 16px", fontSize: 13, color: palette.text, fontWeight: 600 }}>
                Logged in as <br />
                <span style={{ color: palette.accent }}>admin@5starweddings.com</span>
              </div>
              <hr style={{ borderColor: palette.border }} />
              <button
                style={menuBtn(palette, theme)}
                onClick={() => alert("Open Settings (to implement)")}
              >
                <Settings size={14} /> Settings
              </button>
              <button
                style={menuBtn(palette, theme)}
                onClick={() => alert("Logout to implement with Supabase")}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function menuBtn(palette: any, theme: string) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 16px",
    background: "none",
    border: "none",
    textAlign: "left" as const,
    color: palette.text,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "background 0.2s",
    borderRadius: "6px",
    ...(theme === "light"
      ? { hover: { backgroundColor: "rgba(0,0,0,0.05)" } }
      : { hover: { backgroundColor: "rgba(255,255,255,0.1)" } }),
  };
}
