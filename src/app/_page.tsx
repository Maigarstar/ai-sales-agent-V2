"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Sparkles, ArrowRight, ShieldCheck, Diamond, Crown, X } from "lucide-react";

// Initialize Supabase Client for Neural Sync
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const [interceptActive, setInterceptActive] = useState(false);
  const [activeRole, setActiveRole] = useState<"vendor" | "couple" | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerIntercept = (role: "vendor" | "couple") => {
    setActiveRole(role);
    setInterceptActive(true);
  };

  // STAGE 2: NEURAL SYNC HANDLER
  const handleInitializeSync = async () => {
    if (!activeRole || !modalInputValue || isSyncing) return;
    setIsSyncing(true);

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { 
            user_type: activeRole, 
            status: 'new',
            first_message: `Neural Sync Initialized. Role: ${activeRole}. Identifier: ${modalInputValue}`,
            contact_name: activeRole === 'vendor' ? modalInputValue : 'Prospective Couple',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Redirect to registration with sync_id to maintain the neural thread
      window.location.href = `/register?role=${activeRole}&sync_id=${data[0].id}`;
    } catch (err) {
      console.error("Neural Intercept Failed:", err);
      setIsSyncing(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* 1. TOP CENTERED BRANDING NAVIGATION */}
      <nav style={navBarStyle}>
        <div style={logoStyle}>5 STAR WEDDINGS — CONCIERGE</div>
        <div style={navLinks}>
          <Link href="/login" style={loginLink}>Member Login</Link>
          <button onClick={() => triggerIntercept('couple')} style={ctaButtonSmall}>Access Concierge</button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={heroSection}>
        <div style={heroContent}>
          <div style={auraBadge}>
            <Sparkles size={14} /> Powered by Taigenic Intelligence
          </div>
          <h1 style={heroTitle}>
            The Future of <br />
            <span style={{ color: "var(--aura-gold)" }}>Ultra-Luxury</span> Weddings
          </h1>
          <h2 style={heroSubtitle}>5 STAR WEDDINGS</h2>
          <p style={heroSub}>
            Welcome to the 5 Star Weddings Concierge. Aura is your elite intelligence layer, 
            qualifying leads and managing high-ticket connections with surgical precision.
          </p>
          <div style={heroActions}>
            <button onClick={() => triggerIntercept('vendor')} style={primaryBtn}>
              Start Onboarding <ArrowRight size={18} />
            </button>
            <div style={socialProof}>
              <ShieldCheck size={14} color="var(--aura-gold)" /> 
              Trusted by the UK's Top 1% of Wedding Professionals
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-PATH SELECTOR */}
      <section style={dualPathSection}>
        <div style={pathGrid}>
          <div style={pathCard}>
            <div style={insigniaCircle}>
              <Diamond size={24} color="var(--aura-gold)" strokeWidth={1.5} />
            </div>
            <h3 style={cardTitle}>For Professionals</h3>
            <p style={cardText}>Train Aura on your brand voice and let AI qualify every enquiry.</p>
            <button onClick={() => triggerIntercept('vendor')} style={secondaryBtn}>Vendor Entry</button>
          </div>
          <div style={pathCard}>
            <div style={insigniaCircle}>
              <Crown size={24} color="var(--aura-gold)" strokeWidth={1.5} />
            </div>
            <h3 style={cardTitle}>For Couples</h3>
            <p style={cardText}>Experience AI-driven concierge matching with elite vendors.</p>
            <button onClick={() => triggerIntercept('couple')} style={secondaryBtn}>Couple Entry</button>
          </div>
        </div>
      </section>

      {/* 4. NEURAL INTERCEPT MODAL */}
      {interceptActive && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <button style={closeBtn} onClick={() => setInterceptActive(false)}><X size={20} /></button>
            <div style={modalHeader}>
              <Sparkles size={20} color="var(--aura-gold)" />
              <h2 style={modalTitle}>AURA <span style={{ color: "var(--aura-gold)" }}>INTERCEPT</span></h2>
            </div>
            <p style={modalText}>Initializing {activeRole} qualification stream.</p>
            <input 
              style={modalInput} 
              value={modalInputValue}
              onChange={(e) => setModalInputValue(e.target.value)}
              placeholder={activeRole === 'vendor' ? "Boutique Name..." : "Target Wedding Date..."} 
            />
            <button 
              style={{...primaryBtn, opacity: isSyncing ? 0.5 : 1}} 
              disabled={isSyncing}
              onClick={handleInitializeSync}
            >
              {isSyncing ? "SYNCING..." : "INITIALIZE SYNC"}
            </button>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer style={footerStyle}>
        <div style={footerContent}>
          <div style={footerLegal}>
            © 2025 5 STAR WEDDINGS — CONCIERGE PLATFORM. POWERED BY TAIGENIC AI
          </div>
          <div style={footerLinks}>
             <Link href="/privacy" style={legalLink}>Privacy Policy</Link>
             <Link href="/login" style={legalLink}>Admin Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* === BRANDED STYLE SYSTEM === */
const pageWrapper = { backgroundColor: "#0A0C0B", color: "#E0E7E5", minHeight: "100vh", fontFamily: "'Nunito Sans', sans-serif" };
const navBarStyle = { height: "100px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" as const };
const logoStyle = { fontFamily: "'Gilda Display', serif", fontSize: "22px", letterSpacing: "3px", color: "var(--aura-gold)", position: "absolute" as const, left: "50%", transform: "translateX(-50%)" };
const navLinks = { display: "flex", alignItems: "center", gap: "32px", marginLeft: "auto" };
const loginLink = { fontSize: "13px", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: "600" };
const heroSection = { padding: "120px 60px", display: "flex", justifyContent: "center", textAlign: "center" as const };
const heroContent = { maxWidth: "1000px" };
const auraBadge = { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "rgba(197, 160, 89, 0.1)", color: "var(--aura-gold)", borderRadius: "6px", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "40px" };
const heroTitle = { fontFamily: "'Gilda Display', serif", fontSize: "82px", lineHeight: "1.1", margin: "0", letterSpacing: "-1px" };
const heroSubtitle = { fontFamily: "'Gilda Display', serif", fontSize: "48px", color: "#E0E7E5", margin: "10px 0 32px 0", letterSpacing: "4px" };
const heroSub = { fontSize: "19px", color: "#94A39F", lineHeight: "1.6", maxWidth: "720px", margin: "0 auto 48px" };
const heroActions = { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "24px" };
const primaryBtn = { cursor: 'pointer', border: 'none', width: 'fit-content', padding: "20px 48px", backgroundColor: "var(--aura-gold)", color: "#112620", borderRadius: "6px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "12px", fontSize: "16px" };
const socialProof = { fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "8px" };
const dualPathSection = { padding: "100px 60px", backgroundColor: "#0E100F" };
const pathGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "1200px", margin: "0 auto" };
const pathCard = { padding: "60px", backgroundColor: "#141615", border: "1px solid rgba(197, 160, 89, 0.2)", borderRadius: "6px", textAlign: "center" as const, transition: "all 0.3s ease" };
const insigniaCircle = { width: "60px", height: "60px", borderRadius: "50%", border: "1px solid rgba(197, 160, 89, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px auto", backgroundColor: "rgba(197, 160, 89, 0.05)" };
const cardTitle = { fontFamily: "'Gilda Display', serif", fontSize: "28px", color: "#E0E7E5", marginBottom: "16px" };
const cardText = { fontSize: "15px", color: "#94A39F", lineHeight: "1.7", marginBottom: "32px" };
const secondaryBtn = { cursor: 'pointer', background: 'none', padding: "14px 32px", border: "1px solid var(--aura-gold)", color: "var(--aura-gold)", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600" };
const ctaButtonSmall = { cursor: 'pointer', border: 'none', padding: "12px 24px", backgroundColor: "#E0E7E5", color: "#112620", borderRadius: "6px", fontSize: "13px", fontWeight: "700" };
const footerStyle = { padding: "60px", borderTop: "1px solid rgba(255,255,255,0.05)" };
const footerContent = { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" };
const footerLegal = { fontSize: "12px", color: "#666", letterSpacing: "1px" };
const footerLinks = { display: "flex", gap: "20px" };
const legalLink = { color: "#666", fontSize: "12px", textDecoration: "none" };
const modalOverlay = { position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 };
const modalContent = { backgroundColor: "#141615", padding: "50px", borderRadius: "6px", border: "1px solid var(--aura-gold)", maxWidth: "450px", width: "90%", textAlign: "center" as const, position: "relative" as const };
const closeBtn = { position: "absolute" as const, top: "20px", right: "20px", background: "none", border: "none", color: "#666", cursor: "pointer" };
const modalHeader = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" };
const modalTitle = { fontSize: "24px", fontFamily: "'Gilda Display', serif", margin: 0 };
const modalText = { fontSize: "14px", color: "#94A39F", marginBottom: "30px", lineHeight: "1.6" };
const modalInput = { width: "100%", padding: "15px", backgroundColor: "#0A0C0B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#FFF", marginBottom: "20px", outline: "none" };