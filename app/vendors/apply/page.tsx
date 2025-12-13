"use client";

import { useState } from "react";

export default function VendorApplicationPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    website: "",
    instagram: "",
    years_in_business: "",
    location: "",
    category: "",
    description: "",
    message_to_editorial_team: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/vendor-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error("Vendor apply error:", data.error);
        alert("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Vendor apply network error:", err);
      alert("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Gilda Display, serif",
            fontSize: "34px",
            color: "#183F34",
            marginBottom: "16px",
          }}
        >
          Thank You
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#444",
            lineHeight: 1.6,
            fontSize: "17px",
            marginBottom: "32px",
          }}
        >
          Your application has been received.  
          Our team will review your details and come back to you, and you can
          now speak with our concierge assistant.
        </p>

        <a
          href="/vendors-chat"
          style={{
            display: "block",
            width: "220px",
            margin: "0 auto",
            textAlign: "center",
            padding: "14px 20px",
            background: "#183F34",
            borderRadius: "10px",
            color: "white",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Continue to Concierge
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "720px", margin: "0 auto" }}>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Gilda Display, serif",
          fontSize: "34px",
          color: "#183F34",
          marginBottom: "6px",
        }}
      >
        Join The 5 Star Weddings Collection
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#444",
          maxWidth: "520px",
          margin: "0 auto 32px",
          lineHeight: 1.6,
        }}
      >
        A curated showcase of the world’s most exceptional wedding venues and
        luxury vendors. Share your details below and our editorial team will
        review your application.
      </p>

      <form
        onSubmit={submitForm}
        style={{
          background: "#FAFAFA",
          borderRadius: "16px",
          padding: "28px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        }}
      >
        {[
          { label: "Your Name", field: "name" },
          { label: "Email", field: "email" },
          { label: "Phone", field: "phone" },
          { label: "Business Name", field: "business_name" },
          { label: "Website", field: "website" },
          { label: "Instagram", field: "instagram" },
          { label: "Years in Business", field: "years_in_business" },
          { label: "Location", field: "location" },
        ].map((item) => (
          <div key={item.field} style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {item.label}
            </label>
            <input
              type="text"
              value={form[item.field as keyof typeof form]}
              onChange={(e) => update(item.field, e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>
        ))}

        {/* CATEGORY SELECT */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "15px",
            }}
          >
            <option value="">Select category…</option>
            <option value="Venue">Venue</option>
            <option value="Planner">Planner</option>
            <option value="Photographer">Photographer</option>
            <option value="Videographer">Videographer</option>
            <option value="Catering">Catering</option>
            <option value="Florist">Florist</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Beauty">Beauty</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Tell us about your business
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
              fontSize: "15px",
            }}
          />
        </div>

        {/* MESSAGE TO EDITORIAL */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Message to our editorial team (optional)
          </label>
          <textarea
            value={form.message_to_editorial_team}
            onChange={(e) =>
              update("message_to_editorial_team", e.target.value)
            }
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
              fontSize: "15px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: "#183F34",
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            marginTop: "10px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
