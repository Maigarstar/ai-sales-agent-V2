"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

export default function OnboardingStepTwo() {
  const router = useRouter();
  const [tier, setTier] = useState("High-End");

  return (
    <div style={pageBg}>
      <div style={onboardingCard}>
        <div style={progressRow}>
          <div style={circleFinished}><Check size={16} /></div>
          <div style={circleActive}>2</div>
          <div style={circleInactive}>3</div>
        </div>

        <h1 className="luxury-serif" style={headerTitle}>Aura Alignment</h1>
        <p style={headerSubtitle}>Aura uses this to refine her tone when pitching your services to couples.</p>

        <div style={inputContainer}>
          <label style={inputLabel}>TARGET LUXURY TIER</label>
          <select 
            style={selectField} 
            value={tier} 
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="High-End">High-End</option>
            <option value="Ultra-Luxury">Ultra-Luxury</option>
            <option value="Bespoke">Bespoke / Boutique</option>
          </select>
        </div>

        <button style={primaryAction} onClick={() => router.push('/vendors/onboarding/step-3')}>
          Continue to Commercials <ArrowRight size={18} />
        </button>
      </div>
      <footer style={brandFoot}>POWERED BY TAIGENIC AI • SECURED BY AURA VOICE SYSTEMS</footer>
    </div>
  );
}

const pageBg = { minHeight: "100vh", display: "flex", flexDirection: "column" as "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-main)" };
const onboardingCard = { width: "100%", maxWidth: "540px", padding: "60px", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", textAlign: "center" as "center", border: "1px solid var(--border)" };
const progressRow = { display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px" };
const circleFinished = { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#183F34", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center" };
const circleActive = { width: "36px", height: "36px", borderRadius: "50%", border: "2px solid #183F34", color: "#183F34", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" };
const circleInactive = { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#F5F5F5", color: "#BBB", display: "flex", alignItems: "center", justifyContent: "center" };
const headerTitle = { fontSize: "38px", color: "#183F34", marginBottom: "12px" };
const headerSubtitle = { color: "#666", fontSize: "16px", marginBottom: "40px" };
const inputContainer = { textAlign: "left" as "left", marginBottom: "32px" };
const inputLabel = { fontSize: "11px", fontWeight: "700", color: "#AAA", letterSpacing: "1px", marginBottom: "12px", display: "block", textTransform: "uppercase" as "uppercase" };
const selectField = { width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #EEE", backgroundColor: "#FAFAFA", fontSize: "16px", color: "#112620" };
const primaryAction = { width: "100%", padding: "18px", backgroundColor: "#183F34", color: "#FFF", borderRadius: "14px", border: "none", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer" };
const brandFoot = { marginTop: "32px", fontSize: "10px", letterSpacing: "2px", color: "#BBB", textTransform: "uppercase" as "uppercase" };