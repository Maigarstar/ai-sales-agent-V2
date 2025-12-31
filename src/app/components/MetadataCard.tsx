"use client";

interface MetadataCardProps {
  metadata: any;
}

export default function MetadataCard({ metadata }: MetadataCardProps) {
  if (!metadata) return null;

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "24px 28px",
        borderRadius: "16px",
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        fontFamily: "Nunito Sans, sans-serif",
        color: "#111",
      }}
    >
      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontFamily: "Gilda Display, serif",
          fontSize: "22px",
          color: "#183F34",
        }}
      >
        Lead Insights
      </h3>

      {/* Gold divider */}
      <div
        style={{
          width: "50px",
          height: "3px",
          backgroundColor: "#C8A165",
          marginTop: "10px",
          marginBottom: "18px",
          borderRadius: "2px",
        }}
      />

      {/* Data Points */}
      <div style={{ fontSize: "15px", lineHeight: 1.6 }}>
        <p><strong>Score:</strong> {metadata.score ?? "N/A"}</p>
        <p><strong>Lead Type:</strong> {metadata.lead_type ?? "N/A"}</p>
        <p><strong>Category:</strong> {metadata.business_category ?? "N/A"}</p>
        <p><strong>Location:</strong> {metadata.location ?? "N/A"}</p>
        <p><strong>Budget:</strong> {metadata.client_budget ?? "N/A"}</p>
        <p><strong>Timeline:</strong> {metadata.timeline ?? "N/A"}</p>
        <p><strong>Red Flags:</strong> {metadata.red_flags ?? "None"}</p>
      </div>
    </div>
  );
}
