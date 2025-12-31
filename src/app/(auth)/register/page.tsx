"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div style={canvasStyle}>
      {/* Step Indicator - Matches your 'Identity' manifest */}
      <div style={stepContainer}>
        <div style={activeStep}>1</div>
        <div style={inactiveStep}>2</div>
        <div style={inactiveStep}>3</div>
      </div>

      <div style={registrationCard}>
        <header style={headerStyle}>
          <h1 style={gildaHeading}>The Membership</h1>
          <p style={subtextStyle}>Define your business within the Taigenic ecosystem.</p>
        </header>

        <form style={formStyle}>
          {/* Business Name Input */}
          <div style={inputGroup}>
            <label style={labelStyle}>LEGAL BUSINESS NAME</label>
            <input 
              type="text" 
              placeholder="e.g. lovexposed" 
              style={inputStyle} 
            />
          </div>

          {/* Email Input */}
          <div style={inputGroup}>
            <label style={labelStyle}>BOUTIQUE EMAIL</label>
            <input 
              type="email" 
              placeholder="e.g. contact@boutique.com" 
              style={inputStyle} 
            />
          </div>

          {/* Service Category - Matches your dropdown style */}
          <div style={inputGroup}>
            <label style={labelStyle}>SERVICE CATEGORY</label>
            <select style={selectStyle}>
              <option>Wedding Venue</option>
              <option>Luxury Planning</option>
              <option>Floral Architecture</option>
            </select>
          </div>

          <button type="submit" style={primaryBtn}>
            Continue to Identity <ArrowRight size={18} />
          </button>
        </form>

        <footer style={brandFooter}>
           5 STAR WEDDINGS — THE LUXURY WEDDING COLLECTION
        </footer>
      </div>
    </div>
  );
}

/* === THE IDENTITY DESIGN SYSTEM === */
const canvasStyle = {
  backgroundColor: "#FAF7F6", // Boutique Ivory Canvas
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  fontFamily: "'Nunito Sans', sans-serif"
};

const stepContainer = { display: "flex", gap: "12px", marginBottom: "40px" };
const activeStep = { 
  width: "36px", height: "36px", borderRadius: "50%", 
  backgroundColor: "#18342E", color: "#FFF", // Deep Corporate Green
  display: "flex", alignItems: "center", justifyContent: "center", 
  fontSize: "14px", fontWeight: 700 
};
const inactiveStep = { 
  width: "36px", height: "36px", borderRadius: "50%", 
  backgroundColor: "#F0F0F0", color: "#A0A0A0", 
  display: "flex", alignItems: "center", justifyContent: "center", 
  fontSize: "14px" 
};

const registrationCard = {
  backgroundColor: "#FFFFFF",
  width: "100%",
  maxWidth: "540px",
  borderRadius: "32px",
  padding: "80px 60px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.02)",
  textAlign: "center" as const
};

const headerStyle = { marginBottom: "48px" };
const gildaHeading = { 
  fontFamily: "'Gilda Display', serif", 
  fontSize: "48px", 
  color: "#2E2B28", // Refined Charcoal Taupe
  marginBottom: "16px" 
};
const subtextStyle = { color: "#6F6A67", fontSize: "16px", opacity: 0.8 };

const formStyle = { textAlign: "left" as const };
const inputGroup = { marginBottom: "24px" };
const labelStyle = { 
  display: "block", fontSize: "11px", fontWeight: 800, 
  color: "#6F6A67", opacity: 0.6, letterSpacing: "1.5px", marginBottom: "12px" 
};

const inputStyle = {
  width: "100%", padding: "20px", borderRadius: "12px",
  backgroundColor: "#F9F9F9", border: "1px solid #EAE7E3", // Soft Linen Beige
  fontSize: "15px", color: "#2E2B28", outline: "none"
};

const selectStyle = {
  width: "100%", padding: "20px", borderRadius: "12px",
  backgroundColor: "#F9F9F9", border: "1px solid #EAE7E3",
  fontSize: "15px", color: "#2E2B28", appearance: "none" as const
};

const primaryBtn = {
  width: "100%", padding: "22px", borderRadius: "12px",
  backgroundColor: "#18342E", color: "#FFFFFF", // Deep Corporate Green
  border: "none", fontSize: "16px", fontWeight: 700, 
  cursor: "pointer", display: "flex", alignItems: "center", 
  justifyContent: "center", gap: "12px", marginTop: "32px"
};

const brandFooter = {
  marginTop: "48px", fontSize: "9px", fontWeight: 800, 
  letterSpacing: "2px", color: "#6F6A67", opacity: 0.5
};