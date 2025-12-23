"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";

/**
 * 5 STAR WEDDINGS — PARTNER ONBOARDING
 * Fixed: Self-contained components to prevent 404/Import errors.
 */
export default function VendorOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand_name: "",
    website: "",
    contact_email: "",
    description: "",
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) return setStep(step + 1);

    try {
      setLoading(true);
      const { error } = await supabase.from("vendor_applications").insert({
        ...form,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;
      setStep(4);
    } catch (err: any) {
      alert(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={container}>
        {/* HEADER */}
        <header style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={titleStyle}>PARTNER <span style={{ color: "#C5A059" }}>ONBOARDING</span></h1>
          <p style={subtitleStyle}>Apply for elite access to the 5 Star Weddings network.</p>
        </header>

        {/* PROGRESS BAR */}
        <div style={progressContainer}>
          <div style={{ ...progressFill, width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {/* STEP CONTENT */}
        <div style={cardStyle}>
          {step === 1 && (
            <div>
              <h2 style={cardTitle}>Brand Identity</h2>
              <p style={cardSubtitle}>Tell us about your boutique and your unique value.</p>
              <input
                style={inputStyle}
                placeholder="Brand Name"
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Website URL"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={cardTitle}>Contact Information</h2>
              <p style={cardSubtitle}>How can our concierge team reach you?</p>
              <input
                style={inputStyle}
                placeholder="Contact Email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
              <textarea
                style={{ ...inputStyle, height: "120px", resize: "none" }}
                placeholder="Describe your services..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={cardTitle}>Final Review</h2>
              <p style={cardSubtitle}>Ensure your intelligence manifest is accurate.</p>
              <div style={reviewBox}>
                <p><strong>BRAND:</strong> {form.brand_name || "—"}</p>
                <p><strong>WEBSITE:</strong> {form.website || "—"}</p>
                <p><strong>EMAIL:</strong> {form.contact_email || "—"}</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <CheckCircle size={48} color="#C5A059" style={{ marginBottom: "20px" }} />
              <h2 style={cardTitle}>Manifest Received</h2>
              <p style={cardSubtitle}>Our team will review your application shortly.</p>
            </div>
          )}

          {step < 4 && (
            <button
              onClick={handleNext}
              disabled={loading}
              style={primaryBtn}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>CONTINUE <ArrowRight size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* === ELITE MIDNIGHT STYLES === */

const pageWrapper: React.CSSProperties = {
  backgroundColor: "#0A0C0B",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  color: "#E0E7E5",
  fontFamily: "'Nunito Sans', sans-serif"
};

const container = { maxWidth: "480px", width: "100%" };

const titleStyle: React.CSSProperties = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "28px",
  letterSpacing: "3px",
  margin: 0
};

const subtitleStyle = {
  fontSize: "12px",
  color: "#94A39F",
  marginTop: "10px",
  letterSpacing: "1px"
};

const progressContainer = {
  height: "2px",
  backgroundColor: "rgba(255,255,255,0.05)",
  marginBottom: "32px",
  overflow: "hidden"
};

const progressFill = {
  height: "100%",
  backgroundColor: "#C5A059",
  transition: "width 0.4s ease"
};

const cardStyle = {
  backgroundColor: "#141615",
  padding: "40px",
  borderRadius: "6px", // Strict 6px Radius
  border: "1px solid rgba(255,255,255,0.05)"
};

const cardTitle = { fontSize: "18px", fontWeight: 700, color: "#C5A059", marginBottom: "8px" };
const cardSubtitle = { fontSize: "13px", color: "#94A39F", marginBottom: "24px" };

const inputStyle = {
  width: "100%",
  backgroundColor: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "14px",
  color: "#fff",
  fontSize: "14px",
  marginBottom: "16px",
  outline: "none"
};

const primaryBtn = {
  width: "100%",
  backgroundColor: "#C5A059",
  color: "#0A0C0B",
  border: "none",
  padding: "16px",
  borderRadius: "6px",
  fontWeight: 700,
  fontSize: "12px",
  letterSpacing: "2px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "12px"
};

const reviewBox = {
  backgroundColor: "rgba(255,255,255,0.02)",
  padding: "20px",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#94A39F",
  lineHeight: "2"
};