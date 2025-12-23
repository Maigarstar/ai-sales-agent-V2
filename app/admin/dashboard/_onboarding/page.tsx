"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Sparkles, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function IdentityManifest() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    business_name: "",
    category: "Wedding Venue",
    luxury_tier: "Ultra-Luxury",
    investment_floor: "8000",
  });

  const vendorTypes = [
    "Wedding Venue", "Wedding Planner", "Photography", "Cinematography",
    "Floral Artistry", "Couture Bridal Wear", "Gourmet Catering",
    "Live Entertainment", "Fine Jewellery", "Bespoke Stationery", "Elite Collective (Other)"
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, [supabase]);

  const handleFinalSync = async () => {
    if (!userId) {
      alert("No active session found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: formData.business_name,
          category: formData.category,
          luxury_tier: formData.luxury_tier,
          starting_price: parseInt(formData.investment_floor),
          onboarding_completed: true,
        })
        .eq("id", userId);

      if (error) throw error;
      router.push("/admin/dashboard/overview");
      router.refresh();
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={headerBrand}>
        <div style={brandTitle}>5 STAR WEDDINGS</div>
        <div style={brandSubtitle}>THE LUXURY WEDDING COLLECTION</div>
      </div>

      <div style={card}>
        {/* Progress Tracker */}
        <div style={stepRow}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...stepCircle,
                backgroundColor: step >= i ? "#2E2B28" : "#F7F5F3",
                color: step >= i ? "#C5A059" : "#6F6A67",
                border: step >= i ? "none" : "1px solid #EAE7E3",
              }}
            >
              {step > i ? <Check size={16} /> : i}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <section>
            <h1 style={title}>The Identity</h1>
            <p style={subtitle}>Define your presence in the 5 Star Weddings network.</p>
            <div style={inputGroup}>
              <label style={label}>LEGAL BUSINESS NAME</label>
              <input
                style={input}
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Enter Boutique Name"
              />
            </div>
            <div style={inputGroup}>
              <label style={label}>SERVICE CATEGORY</label>
              <select
                style={input}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {vendorTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <button style={button} onClick={() => setStep(2)}>
              Continue <ArrowRight size={18} />
            </button>
          </section>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <section>
            <h1 style={title}>Brand Voice</h1>
            <p style={subtitle}>Refine how Aura represents your unique signature.</p>
            <div style={inputGroup}>
              <label style={label}>TARGET LUXURY TIER</label>
              <select
                style={input}
                value={formData.luxury_tier}
                onChange={(e) => setFormData({ ...formData, luxury_tier: e.target.value })}
              >
                <option value="High-End">High-End</option>
                <option value="Ultra-Luxury">Ultra-Luxury</option>
                <option value="Bespoke">Bespoke</option>
              </select>
            </div>
            <button style={button} onClick={() => setStep(3)}>
              Finalize Commercials <ArrowRight size={18} />
            </button>
          </section>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <section>
            <h1 style={title}>Asset Sync</h1>
            <p style={subtitle}>Set your Investment Floor for lead qualification.</p>
            <div style={inputGroup}>
              <label style={label}>INVESTMENT FLOOR (£)</label>
              <input
                style={input}
                type="number"
                value={formData.investment_floor}
                onChange={(e) =>
                  setFormData({ ...formData, investment_floor: e.target.value })
                }
              />
            </div>
            <div style={verificationNote}>
              <ShieldCheck size={16} color="#C5A059" />
              <span style={{ color: "#2E2B28" }}>Verified by 5 Star Weddings</span>
            </div>
            <button style={button} onClick={handleFinalSync} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Initialize Aura Concierge <Sparkles size={18} />
                </>
              )}
            </button>
          </section>
        )}

        {/* Footer */}
        <footer style={footer}>
          <div style={footerLine}></div>
          <div style={footerText}>
            © 2025 5 STAR WEDDINGS — CONCIERGE PLATFORM{" "}
            <span style={{ color: "#C5A059" }}>POWERED BY TAIGENIC AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* === LUXURY STYLE SYSTEM === */
const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "#FAF7F6",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Nunito Sans', sans-serif",
};

const headerBrand = {
  position: "absolute" as const,
  top: "40px",
  textAlign: "center" as const,
};

const brandTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "22px",
  letterSpacing: "2px",
  color: "#2E2B28",
  fontWeight: 500,
};

const brandSubtitle = {
  fontSize: "10px",
  letterSpacing: "3px",
  color: "#C5A059",
  marginTop: "4px",
  fontWeight: 700,
};

const card = {
  width: "100%",
  maxWidth: "580px",
  backgroundColor: "#FFFFFF",
  padding: "80px 60px",
  borderRadius: "48px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
  textAlign: "center" as const,
};

const stepRow = { display: "flex", justifyContent: "center", gap: "16px", marginBottom: "50px" };
const stepCircle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "800",
};
const title = { fontFamily: "'Gilda Display', serif", fontSize: "56px", color: "#2E2B28", marginBottom: "16px" };
const subtitle = { color: "#6F6A67", fontSize: "18px", opacity: 0.75, marginBottom: "48px" };
const inputGroup = { textAlign: "left" as const, marginBottom: "32px" };
const label = { fontSize: "12px", fontWeight: "800", color: "#6F6A67", opacity: 0.8, letterSpacing: "1.5px", marginBottom: "12px", display: "block" };
const input = {
  width: "100%",
  padding: "24px",
  borderRadius:
