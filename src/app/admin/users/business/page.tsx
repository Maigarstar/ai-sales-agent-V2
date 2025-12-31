"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowUpRight,
  User,
  Mail,
  Phone,
} from "lucide-react";

type BusinessUser = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  user_type: string;
  category: string;
  luxury_tier: string;
  onboarding_completed: boolean;
};

export default function BusinessUsersPage() {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEMO DATA
    setTimeout(() => {
      setUsers([
        {
          id: "demo-the-ritz",
          business_name: "The Ritz London",
          contact_name: "Events Director",
          email: "events@theritzlondon.com",
          phone: "+44 20 7493 8181",
          user_type: "Business",
          category: "Luxury Wedding Venue",
          luxury_tier: "Platinum",
          onboarding_completed: false,
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div style={{ padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" }}>
      {/* ANCHOR LINK */}
      <Link
        href="/admin/business"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          fontSize: "13px",
          color: "#666",
          textDecoration: "none",
        }}
      >
        ← Business users
      </Link>

      <h1
        style={{
          fontFamily: "'Gilda Display', serif",
          fontSize: "32px",
          marginBottom: "8px",
        }}
      >
        Business Users
      </h1>

      <p style={{ color: "#666", fontSize: "15px", marginBottom: "30px" }}>
        Vendors, planners, venues, and commercial partners on the platform.
      </p>

      {loading ? (
        <p style={{ color: "#999" }}>Loading business users…</p>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#FAFAFA",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <th style={th}>Business & Contact</th>
                <th style={th}>Category</th>
                <th style={th}>Tier</th>
                <th style={th}>Onboarding</th>
                <th style={th}></th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={avatar}>
                        <Building2 size={14} />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontWeight: 600, color: "#183F34" }}>
                          {user.business_name}
                        </div>

                        <div style={subRow}>
                          <User size={12} /> {user.contact_name}
                        </div>

                        <div style={subRow}>
                          <Mail size={12} /> {user.email}
                        </div>

                        <div style={subRow}>
                          <Phone size={12} /> {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={td}>{user.category}</td>

                  <td style={td}>
                    <span style={tierTag}>{user.luxury_tier}</span>
                  </td>

                  <td style={td}>
                    {user.onboarding_completed ? (
                      <span style={successTag}>
                        <CheckCircle2 size={12} /> Complete
                      </span>
                    ) : (
                      <span style={pendingTag}>Pending</span>
                    )}
                  </td>

                  <td style={td}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      style={viewLink}
                    >
                      View <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* STYLES */

const th = {
  textAlign: "left" as const,
  padding: "16px 24px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#AAA",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const td = {
  padding: "18px 24px",
  verticalAlign: "top" as const,
};

const avatar = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: "#F4F4F4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#999",
};

const subRow = {
  fontSize: 12,
  color: "#777",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const tierTag = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: "linear-gradient(135deg,#E6C87A,#C8A44B)",
  color: "#1A1A1A",
};

const successTag = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 600,
  background: "rgba(24,63,52,0.1)",
  color: "#183F34",
};

const pendingTag = {
  padding: "6px 10px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 600,
  background: "rgba(0,0,0,0.05)",
  color: "#777",
};

const viewLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: "#183F34",
  textDecoration: "none",
  fontWeight: 600,
};
