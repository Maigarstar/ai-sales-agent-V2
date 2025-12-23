"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const name = user?.user_metadata?.full_name || "Admin";
  const email = user?.email || "user@5starweddingdirectory.com";
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <div style={{ position: "relative" }}>
      <div style={profileButton} onClick={() => setOpen(!open)}>
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            style={{ width: 34, height: 34, borderRadius: "50%" }}
          />
        ) : (
          <div style={avatarFallback}>
            {name[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {open && (
        <div style={dropdown}>
          <div style={dropdownHeader}>
            <p style={nameText}>{name}</p>
            <p style={emailText}>{email}</p>
          </div>
          <button style={dropdownItem} onClick={() => router.push("/admin/settings")}>
            <Settings size={14} /> Settings
          </button>
          <button style={dropdownItem} onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* === Styles === */
const profileButton = {
  cursor: "pointer",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid #183F34",
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#E7EFEA",
};

const avatarFallback = {
  fontWeight: 700,
  color: "#183F34",
  fontSize: "14px",
};

const dropdown = {
  position: "absolute" as const,
  top: "42px",
  right: 0,
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  width: "200px",
  zIndex: 50,
  overflow: "hidden",
};

const dropdownHeader = {
  padding: "12px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const nameText = { fontWeight: 700, fontSize: "14px", color: "#183F34" };
const emailText = { fontSize: "12px", color: "#777" };

const dropdownItem = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "10px 16px",
  background: "none",
  border: "none",
  color: "#183F34",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left" as const,
  transition: "background 0.2s ease",
};
