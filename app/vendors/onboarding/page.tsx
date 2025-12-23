"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Sparkles, ArrowRight, Building2, Crown, PoundSterling, ShieldCheck } from "lucide-react";

export default function LuxuryOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    business_name: "",
    category: "Photography",
    luxury_tier: "High-End",
    starting_price: "1000",
  });

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: formData.business_name,
          category: formData.category,
          luxury_tier: formData.luxury_tier,
          starting_price: parseInt(formData.starting_price),
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (!error) {
        router.push("/dashboard?welcome=true");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={onboardingCard}>
        {/* Architectural Step Indicator */}
        <div style={stepRow}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              ...stepCircle,
              backgroundColor: step >= i ? "#183F34" : "#F3F4F6",
              color: step >= i ? "#FFFFFF" : "#9CA3AF"
            }}>
              {step > i ? <Check size={16} /> : i}
            </div>
          ))}
        </div>

        {/* Step 1: The Identity */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h1 style={titleStyle}>The Identity</h1>
            <p style={subtitleStyle}>Define your business within the Taigenic ecosystem.</p>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Legal Business Name</label>
              <input 
                style={inputField} 
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                placeholder="e.g. lovexposed"
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Service Category</label>
              <select 
                style={inputField}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Venue">Wedding Venue</option>
                <option value="Planner">Wedding Planner</option>
                <option value="Photographer">Photographer</option>
                <option value="Videographer">Videographer</option>
                <option value="Boutique">Boutique</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            <button style={goldBtn} onClick={() => setStep(2)}>
              Continue to Brand Voice <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Brand Voice */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <h1 style={titleStyle}>Brand Voice</h1>
            <p style={subtitleStyle}>Aura uses this to refine her tone when pitching your services.</p>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Target Luxury Tier</label>
              <select 
                style={inputField}
                value={formData.luxury_tier}
                onChange={(e) => setFormData({...formData, luxury_tier: e.target.value})}
              >
                <option value="High-End">High-End</option>
                <option value="Ultra-Luxury">Ultra-Luxury</option>
                <option value="Bespoke">Bespoke / Boutique</option>
              </select>
            </div>

            <button style={goldBtn} onClick={() => setStep(3)}>
              Finalize Commercials <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Asset Sync */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500">
            <h1 style={titleStyle}>Asset Sync</h1>
            <p style={subtitleStyle}>Set your starting commercials for Aura's lead qualification.</p>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Starting Investment (£)</label>
              <input 
                style={inputField}
                type="number"
                value={formData.starting_price}
                onChange={(e) => setFormData({...formData, starting_price: e.target.value})}
              />
            </div>

            <div style={assetLockNote}>
              <ShieldCheck size={16} color="#183F34" />
              <span>Secured by Aura Voice Systems</span>
            </div>

            <button style={launchBtn} onClick={handleComplete} disabled={loading}>
              {loading ? "Syncing Taigenic..." : "Initialize Aura Concierge"} <Sparkles size={18} />
            </button>
          </div>
        )}
      </div>
      
      <footer style={footerBranding}>
        POWERED BY TAIGENIC AI • SECURED BY AURA VOICE SYSTEMS
      </footer>
    </div>
  );
}

/* === REFINED ARCHITECTURAL STYLES === */
const containerStyle = { minHeight: "100vh", backgroundColor: "#F9F8F6", display: "flex", flexDirection: "column" as "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Nunito Sans', sans-serif" };
const onboardingCard = { width: "100%", maxWidth: "580px", backgroundColor: "#fff", padding: "80px 60px", borderRadius: "32px", boxShadow: "0 40px 100px rgba(0,0,0,0.03)", textAlign: "center" as "center" };
const stepRow = { display: "flex", justifyContent: "center", gap: "16px", marginBottom: "50px" };
const stepCircle = { width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" };

const titleStyle = { fontFamily: "'Gilda Display', serif", fontSize: "48px", color: "#183F34", marginBottom: "12px" };
const subtitleStyle = { color: "#6B7280", fontSize: "16px", marginBottom: "40px", lineHeight: "1.6" };

const inputGroup = { textAlign: "left" as "left", marginBottom: "25px" };
const labelStyle = { fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "1.5px", marginBottom: "10px", display: "block", textTransform: "uppercase" as "uppercase" };
const inputField = { width: "100%", padding: "18px", borderRadius: "12px", border: "1px solid #F3F4F6", fontSize: "16px", backgroundColor: "#FAFAFA", outline: "none", color: "#112620" };

const goldBtn = { width: "100%", padding: "20px", backgroundColor: "#183F34", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const launchBtn = { ...goldBtn, backgroundColor: "#112620", border: "1px solid #C5A059" };

const assetLockNote = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "-10px", marginBottom: "30px", fontSize: "11px", color: "#183F34", fontWeight: 700, opacity: 0.6 };
const footerBranding = { marginTop: "40px", fontSize: "10px", letterSpacing: "2px", color: "#9CA3AF", textAlign: "center" as "center", fontWeight: 700 };