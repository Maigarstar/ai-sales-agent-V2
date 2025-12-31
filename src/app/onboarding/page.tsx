"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function SaaSOnboarding() {
  const [role, setRole] = useState<"Vendor" | "Couple">("Vendor");
  const [name, setName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const finalizeIdentity = async () => {
    setIsSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Create the production profile
      await supabase.from("profiles").upsert({
        id: user.id,
        role: role,
        display_name: name,
        onboarding_completed: false,
        created_at: new Date().toISOString()
      });

      // Direct to role-specific Neural Training
      router.push(role === "Vendor" ? "/dashboard/brand-voice" : "/dashboard/wedding-vision");
    }
  };

  return (
    <div style={canvasStyle}>
      <div style={membershipCard}>
        <div style={toggleWrapper}>
           <button onClick={() => setRole("Vendor")} style={role === "Vendor" ? activeTab : tab}>Vendor</button>
           <button onClick={() => setRole("Couple")} style={role === "Couple" ? activeTab : tab}>Couple</button>
        </div>
        
        <h1 style={gildaTitle}>The Membership</h1>
        <p style={subtext}>Initialize your presence in the 5-Star Collection.</p>

        <div style={formGroup}>
          <label style={labelStyle}>{role === "Vendor" ? "BUSINESS NAME" : "FULL NAMES"}</label>
          <input 
            style={textInput} 
            placeholder="e.g. LoveExposed" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button onClick={finalizeIdentity} disabled={!name || isSyncing} style={primaryBtn}>
          {isSyncing ? "SYNCING NEURAL IDENTITY..." : "CONTINUE TO IDENTITY →"}
        </button>
      </div>
    </div>
  );
}

/* PRODUCTION STYLES */
const canvasStyle = { backgroundColor: "#F9F9F9", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" };
const membershipCard = { backgroundColor: "#FFF", padding: "60px", borderRadius: "40px", width: "100%", maxWidth: "550px", boxShadow: "0 20px 50px rgba(0,0,0,0.04)" };
const gildaTitle = { fontFamily: "'Gilda Display', serif", fontSize: "42px", color: "#1D352F", marginBottom: "12px", textAlign: "center" as const };
const toggleWrapper = { display: "flex", background: "#F1F1F0", borderRadius: "100px", padding: "5px", marginBottom: "40px" };
const tab = { flex: 1, padding: "12px", border: "none", background: "none", cursor: "pointer", fontWeight: 700, color: "#6F6A67" };
const activeTab = { ...tab, background: "#1D352F", color: "#FFF", borderRadius: "100px" };
const primaryBtn = { width: "100%", padding: "20px", background: "#1D352F", color: "#FFF", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" };
const textInput = { width: "100%", padding: "18px", borderRadius: "10px", border: "1px solid #EAE7E3", marginTop: "10px", fontSize: "16px" };
const labelStyle = { fontSize: "10px", fontWeight: 800, color: "#999", letterSpacing: "1px" };
const subtext = { textAlign: "center" as const, color: "#6F6A67", marginBottom: "40px", fontSize: "14px" };
const formGroup = { marginBottom: "30px" };