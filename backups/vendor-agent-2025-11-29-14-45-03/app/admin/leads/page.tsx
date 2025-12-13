// app/admin/leads/page.tsx
import React from "react";

export default async function AdminLeadsPage() {
  const res = await fetch("http://localhost:3000/api/admin/leads", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        Vendor Lead Dashboard
      </h1>

      {data.leads.length === 0 && <p>No leads yet.</p>}

      <ul>
        {data.leads.map((lead: any) => (
          <li
            key={lead.id}
            style={{
              marginBottom: "20px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <p><strong>Message:</strong> {lead.message}</p>
            <p><strong>Lead Score:</strong> {lead.score}</p>
            <p><strong>Type:</strong> {lead.lead_type}</p>
            <p><strong>Budget:</strong> {lead.client_budget}</p>
            <p><strong>Location:</strong> {lead.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
