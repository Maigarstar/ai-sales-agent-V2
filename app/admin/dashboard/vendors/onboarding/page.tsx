"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles, MessageSquare, ShieldCheck, Save, Target, MapPin } from "lucide-react";

export default function AuraOnboarding() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSync = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      about: profile.about,
      luxury_tier: profile.luxury_tier,
      starting_price: profile.starting_price,
      // FIX: Added the new intelligence columns to the update logic
      service_locations: profile.service_locations,
      aura_instructions: profile.aura_instructions,
      onboarding_completed: true
    }).eq("id", profile.id);

    setStatus(error ? "Sync Failed" : "Aura Intelligence Updated");
    setSaving(false);
    setTimeout(() => setStatus(""), 3000);
  };

  if (!profile) return <div className="p-20 text-center luxury-serif">Initialising Aura Engine...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header style={{ marginBottom: "48px" }}>
        <div style={auraBadge}><Sparkles size={14} /> Step 2: Brand Voice</div>
        <h1 className="luxury-serif" style={title}>Train Your Concierge</h1>
        <p style={subtext}>Define the parameters Aura uses to qualify and engage your high-net-worth leads.</p>
      </header>

      <div style={onboardingGrid}>
        {/* TONE & PERSONALITY */}
        <section style={cardStyle}>
          <div style={cardHeader}>
            <MessageSquare size={18} color="var(--aura-gold)" />
            <h3 className="luxury-serif">Aura Personality</h3>
          </div>
          <p style={instruction}>Describe your brand tone (e.g., "Editorial, sophisticated, yet approachable").</p>
          <textarea 
            style={textArea} 
            value={profile.about || ""} 
            onChange={(e) => setProfile({...profile, about: e.target.value})}
            placeholder="Aura will adopt this voice in all live chats..."
          />
        </section>

        {/* FIX: ADDED SERVICE INTELLIGENCE SECTION */}
        <section style={cardStyle}>
          <div style={cardHeader}>
            <ShieldCheck size={18} color="var(--aura-gold)" />
            <h3 className="luxury-serif">Service Intelligence</h3>
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Operational Regions</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "var(--bg-main)", padding: "0 14px", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <MapPin size={16} color="#666" />
              <input 
                style={{ ...inputStyle, border: "none", padding: "14px 0" }} 
                placeholder="e.g. London, Cotswolds, Italy (Destination)" 
                value={profile.service_locations || ""} 
                onChange={(e) => setProfile({...profile, service_locations: e.target.value})}
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Specific Instructions for Aura</label>
            <textarea 
              style={{...textArea, height: "100px"}} 
              placeholder="e.g. If a client asks for a discount, politely explain we are a fixed-fee luxury service." 
              value={profile.aura_instructions || ""} 
              onChange={(e) => setProfile({...profile, aura_instructions: e.target.value})}
            />
          </div>
        </section>

        {/* QUALIFICATION LOGIC */}
        <section style={cardStyle}>
          <div style={cardHeader}>
            <Target size={18} color="var(--aura-gold)" />
            <h3 className="luxury-serif">Qualification Logic</h3>
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Investment Floor (£)</label>
            <input 
              type="number" 
              style={inputStyle} 
              value={profile.starting_price || ""} 
              onChange={(e) => setProfile({...profile, starting_price: e.target.value})}
            />
            <p style={instruction}>Leads below this investment will be handled as 'low-priority' by Aura.</p>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Target Market</label>
            <select 
              style={inputStyle} 
              value={profile.luxury_tier || "High-End"}
              onChange={(e) => setProfile({...profile, luxury_tier: e.target.value})}
            >
              <option>High-End</option>
              <option>Ultra-Luxury</option>
              <option>Bespoke / HNWI</option>
            </select>
          </div>
        </section>
      </div>

      <div style={actionArea}>
        <button onClick={handleSync} disabled={saving} style={syncBtn}>
          {saving ? "Syncing Engine..." : "Sync Aura Intelligence"} <Save size={18} />
        </button>
        {status && <div style={statusMsg}>{status}</div>}
      </div>
    </div>
  );
}

/* =========================================================
   SHARP LUXURY ONBOARDING STYLES (6px Radius)
   ========================================================= */
const auraBadge = { display: "flex", alignItems: "center", gap: "8px", color: "var(--aura-gold)", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" as "uppercase", marginBottom: "12px" };
const title = { fontSize: "42px", color: "var(--text-primary)", marginBottom: "12px" };
const subtext = { color: "var(--text-secondary)", fontSize: "16px", marginBottom: "40px" };

const onboardingGrid = { display: "flex", flexDirection: "column" as "column", gap: "24px" };
const cardStyle = { padding: "40px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px" };
const cardHeader = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" };
const instruction = { fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" };

const textArea = { width: "100%", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "16px", fontSize: "14px", outline: "none", resize: "none" as "none" };
const inputGroup = { marginBottom: "24px" };
const labelStyle = { display: "block", fontSize: "11px", fontWeight: "700", color: "#AAA", textTransform: "uppercase" as "uppercase", marginBottom: "8px", letterSpacing: "1px" };
const inputStyle = { width: "100%", padding: "14px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", outline: "none" };

const actionArea = { marginTop: "48px", display: "flex", flexDirection: "column" as "column", alignItems: "center", gap: "16px" };
const syncBtn = { padding: "18px 48px", backgroundColor: "#112620", color: "var(--aura-gold)", border: "1px solid var(--aura-gold)", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textTransform: "uppercase" as "uppercase", letterSpacing: "1px" };
const statusMsg = { fontSize: "12px", color: "var(--aura-gold)", fontWeight: "600", letterSpacing: "1px" };