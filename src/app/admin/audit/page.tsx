"use client";

import { useEffect, useState } from "react";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // DEMO DATA ONLY
    setLogs([
      {
        id: 1,
        created_at: "2025-01-01 09:12",
        admin_email: "admin@5starweddings.com",
        action: "Suspended business account",
        target_type: "Business",
        target_id: "the-ritz-london",
      },
      {
        id: 2,
        created_at: "2025-01-01 09:18",
        admin_email: "admin@5starweddings.com",
        action: "Reset onboarding",
        target_type: "Business",
        target_id: "the-ritz-london",
      },
    ]);
  }, []);

  return (
    <div style={{ padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" }}>
      <h1 style={{ fontFamily: "'Gilda Display', serif", fontSize: "32px", marginBottom: "20px" }}>
        Audit Log
      </h1>

      <div style={{ border: "1px solid #E5E7EB", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              <th style={th}>Time</th>
              <th style={th}>Admin</th>
              <th style={th}>Action</th>
              <th style={th}>Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                <td style={td}>{log.created_at}</td>
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
