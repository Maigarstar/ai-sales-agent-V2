"use client";

import { useEffect, useState } from "react";
import { User, Shield, Mail } from "lucide-react";

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Concierge" | "Editor";
};

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEMO DATA (replace with Supabase later)
    setTimeout(() => {
      setUsers([
        {
          id: "admin-1",
          name: "Taiwo Adedayo",
          email: "admin@5starweddings.com",
          role: "Admin",
        },
        {
          id: "concierge-1",
          name: "Concierge AI",
          email: "concierge@5starweddings.com",
          role: "Concierge",
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div style={page}>
      <h1 style={title}>Users</h1>
      <p style={subtitle}>
        Manage access to the Concierge Workspace and platform intelligence.
      </p>

      {loading ? (
        <p style={empty}>Loading users…</p>
      ) : users.length === 0 ? (
        <p style={empty}>No users found.</p>
      ) : (
        <div style={card}>
          {users.map((user) => (
            <div key={user.id} style={row}>
              <div style={avatar}>
                <User size={14} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={name}>{user.name}</div>
                <div style={email}>
                  <Mail size={12} /> {user.email}
                </div>
              </div>

              <span style={roleTag}>
                <Shield size={12} /> {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: "70px 100px",
  fontFamily: "'Nunito Sans', sans-serif",
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 32,
  marginBottom: 6,
};

const subtitle = {
  fontSize: 14,
  color: "#666",
  marginBottom: 30,
};

const empty = {
  fontSize: 14,
  color: "#999",
};

const card = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  overflow: "hidden",
};

const row = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "16px 20px",
  borderBottom: "1px solid #F0F0F0",
};

const avatar = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: "#F4F4F4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const name = {
  fontWeight: 600,
  color: "#183F34",
};

const email = {
  fontSize: 12,
  color: "#777",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const roleTag = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: "rgba(24,63,52,0.12)",
  color: "#183F34",
};
