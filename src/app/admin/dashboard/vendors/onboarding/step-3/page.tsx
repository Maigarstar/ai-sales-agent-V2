"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";

export default function OnboardingStepThree() {
  const router = useRouter();
  const [price, setPrice] = useState("1000");

  const handleInitialize = () => {
    // Logic to update Supabase goes here
    router.push("/dashboard");
  };

  return (
    <div style={container}>
      <div style={cardWrapper}>
        <div style={indicatorBox}>
          <div style={dotDone}><Check size={16} /></div>
          <div style={dotDone}><Check size={16} /></div>
          <div style={dotActive}>3</div>
        </div>

        <h1 className="luxury-serif" style={mainHeader}>Finalize Launch</h1>
        <p style={subHeader}>Aura uses this data to qualify your leads instantly.</p>

        <div style={formGroup}>
          <label style={fieldLabel}>STARTING INVESTMENT (£)</label>
          <input 
            type="number" 
            style={currencyInput} 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
          />
        </div>

        <button style={syncBtn} onClick={handleInitialize}>
          Initialize Aura Concierge <Sparkles size={18} />
        </button>
      </div>
      <footer style={attribution}>POWERED BY TAIGENIC AI • SECURED BY AURA VOICE SYSTEMS</footer>
    </div>
  );
}

const container = { minHeight: "100vh", display: "flex", flexDirection: "column" as "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-main)" };
const cardWrapper = { width: "100%", maxWidth: "540px", padding: "60px", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", textAlign: "center" as "center", border: "1px solid var(--border)" };
const indicatorBox = { display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px" };
const dotDone = { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#183F34", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center" };
const dotActive = { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#2D3E38", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" };
const mainHeader = { fontSize: "42px", color: "#183F34", marginBottom: "12px" };
const subHeader = { color: "#666", fontSize: "16px", marginBottom: "40px" };
const formGroup = { textAlign: "left" as "left", marginBottom: "32px" };
const fieldLabel = { fontSize: "11px", fontWeight: "700", color: "#AAA", letterSpacing: "1px", marginBottom: "12px", display: "block" };
const currencyInput = { width: "100%", padding: "18px", borderRadius: "14px", border: "1px solid #EEE", backgroundColor: "#FAFAFA", fontSize: "18px", color: "#112620" };
const syncBtn = { width: "100%", padding: "18px", backgroundColor: "#183F34", color: "#FFF", borderRadius: "14px", border: "none", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer" };
const attribution = { marginTop: "32px", fontSize: "10px", letterSpacing: "2px", color: "#BBB" };