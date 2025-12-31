"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  created_at: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // DEMO DATA ONLY, SAFE PLACEHOLDER
    setLogs([
      {
        id: "1",
        created_at: "2025-01-01 09:12",
        admin_email: "admin@5starweddings.com",
        action: "Suspended business account",
        target_type: "Business",
        target_id: "the-ritz-london",
      },
      {
        id: "2",
        created_at: "2025-01-01 09:18",
        admin_email: "admin@5starweddings.com",
        action: "Reset onboarding",
        target_type: "Business",
        target_id: "the-ritz-london",
      },
      {
        id: "3",
        created_at: "2025-01-01 10:01",
        admin_email: "system",
        action: "Lead auto escalated to human",
        target_type: "Lead",
        target_id: "lead_98321",
      },
    ]);
  }, []);

  return (
    <div style={{ padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" }}>
      <h1
        style={{
          fontFamily: "'Gilda Display', serif",
          fontSize: "32px",
          marginBottom: "8px",
        }}
      >
        Audit Log
      </h1>

      <p style={{ color: "#666", fontSize: "15px", marginBottom: "30px" }}>
        Immutable record of all administrative and system actions.
      </p>

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
            <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #E5E7EB" }}>
              <th style={th}>Time</th>
              <th style={th}>Actor</th>
              <th style={th}>Action</th>
              <th style={th}>Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                <td style={td}>
                  {new Date(log.created_at).toLocaleString("en-GB")}
                </td>
                <td style={td}>{log.admin_email}</td>
                <td style={td}>{log.action}</td>
                <td style={td}>
                  {log.target_type} ({log.target_id})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* styles */

const th = {
  textAlign: "left" as const,
  padding: "14px 18px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#AAA",
  textTransform: "uppercase" as const,
};

const td = {
  padding: "16px 18px",
  fontSize: "13px",
};
