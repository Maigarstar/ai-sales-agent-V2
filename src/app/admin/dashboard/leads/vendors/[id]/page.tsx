"use client";

import { useEffect, useState } from "react";

export default function VendorApplicationDetail({ params }: any) {
  const { id } = params;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/get-vendor?id=${id}`);
      const data = await res.json();
      setApp(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    await fetch("/api/admin/update-vendor-status", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
    alert("Status updated");
    window.location.reload();
  }

  if (loading) return <p>Loading…</p>;
  if (!app) return <p>Application not found.</p>;

  return (
    <div style={{ padding: 40, maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "Gilda Display, serif",
          fontSize: "34px",
          color: "#183F34",
          marginBottom: 20,
        }}
      >
        {app.business_name}
      </h1>

      <div
        style={{
          background: "#FAFAFA",
          padding: 24,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        {[
          ["Name", app.name],
          ["Email", app.email],
          ["Phone", app.phone],
          ["Website", app.website],
          ["Instagram", app.instagram],
          ["Years in Business", app.years_in_business],
          ["Location", app.location],
          ["Category", app.category],
          ["Description", app.description],
          ["Message to Editorial Team", app.message_to_editorial_team],
          ["Status", app.status],
          ["Submitted", new Date(app.created_at).toLocaleString()],
        ].map(([label, value]) => (
          <p key={label} style={{ marginBottom: 12 }}>
            <strong>{label}:</strong> {value || "—"}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <button
          onClick={() => updateStatus("approved")}
          style={{
            background: "#183F34",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          Approve
        </button>

        <button
          onClick={() => updateStatus("declined")}
          style={{
            background: "#B00020",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
