"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Settings, UserCog } from "lucide-react";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    async function loadAdmin() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .eq("id", session.session.user.id)
        .single();

      setAdminUser(data);
      setLoading(false);
    }

    loadAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading settings…
      </div>
    );
  }

  return (
    <div style={{ padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" }}>
      <h1
        style={{
          fontFamily: "'Gilda Display', serif",
          fontSize: "32px",
          marginBottom: "8px",
        }}
      >
        Admin Settings
      </h1>

      <p style={{ color: "#666", fontSize: "15px", marginBottom: "40px" }}>
        System configuration and administrative controls.
      </p>

      {/* PROFILE */}
      <section style={card}>
        <div style={sectionHeader}>
          <UserCog size={18} />
          Admin Profile
        </div>

        <div style={row}>
          <strong>Name</strong>
          <span>{adminUser?.full_name || "—"}</span>
        </div>

        <div style={row}>
          <strong>Role</strong>
          <span>{adminUser?.role || "admin"}</span>
        </div>

        <div style={row}>
          <strong>Joined</strong>
          <span>
            {adminUser?.created_at
              ? new Date(adminUser.created_at).toLocaleDateString("en-GB")
              : "—"}
          </span>
        </div>
      </section>

      {/* SECURITY */}
      <section style={card}>
        <div style={sectionHeader}>
          <ShieldCheck size={18} />
          Security
        </div>

        <div style={row}>
          <strong>Authentication</strong>
          <span>Supabase Auth (Active)</span>
        </div>

        <div style={row}>
          <strong>Session</strong>
          <span>Secure</span>
        </div>
      </section>

      {/* SYSTEM */}
      <section style={card}>
        <div style={sectionHeader}>
          <Settings size={18} />
          System
        </div>

        <div style={row}>
          <strong>Environment</strong>
          <span>Production</span>
        </div>

        <div style={row}>
          <strong>Platform</strong>
          <span>Taigenic AI · 5 Star Weddings</span>
        </div>
      </section>
    </div>
  );
}

/* styles */

const card = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "30px",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: 600,
  marginBottom: "16px",
  color: "#183F34",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #F3F4F6",
};
