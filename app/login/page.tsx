"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // Ensure this helper exists
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/admin"; // Redirect to your fixed Admin dashboard
    }
  };

  return (
    <div style={pageWrapper}>
      {/* 1. NAVIGATION BAR */}
      <nav style={navBarStyle}>
        <div style={logoStyle}>5 STAR WEDDINGS</div>
        <Link href="/" style={backLink}>Back to Concierge</Link>
      </nav>

      {/* 2. LOGIN CARD */}
      <section style={loginSection}>
        <div style={loginCard}>
          <div style={auraBadge}>
            <Sparkles size={14} /> Neural Access Point
          </div>
          
          <h1 style={titleStyle}>MEMBER LOGIN</h1>
          <p style={subtitleStyle}>Re-entering the 5 Star Weddings ecosystem.</p>

          <form style={formStyle} onSubmit={handleLogin}>
            {error && <div style={errorBanner}>{error}</div>}

            <div style={inputGroup}>
              <label style={labelStyle}>IDENTITY (EMAIL)</label>
              <div style={inputWrapper}>
                <Mail size={18} style={iconStyle} />
                <input 
                  type="email" 
                  style={inputField} 
                  required
                  placeholder="name@boutique.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>NEURAL KEY (PASSWORD)</label>
                <Link href="/forgot-password" style={forgotLink}>Forgot Key?</Link>
              </div>
              <div style={inputWrapper}>
                <Lock size={18} style={iconStyle} />
                <input 
                  type="password" 
                  style={inputField} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button style={primaryBtn} disabled={loading}>
              {loading ? (
                <>AUTHENTICATING... <Loader2 size={18} className="animate-spin" /></>
              ) : (
                <>INITIALIZE SESSION <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={socialProof}>
            <ShieldCheck size={14} color="var(--aura-gold)" /> 
            Secured by Aura Voice Systems
          </div>
        </div>
      </section>

      {/* 3. HIGH-VISIBILITY BRANDED FOOTER */}
      <footer style={footerStyle}>
        <div style={footerDivider}></div>
        <p style={footerBranding}>
          © 2025 5 STAR WEDDINGS — CONCIERGE PLATFORM
        </p>
        <p style={taigenicBranding}>
          POWERED BY <span style={{ color: "var(--aura-gold)", fontWeight: 800 }}>TAIGENIC AI</span>
        </p>
      </footer>
    </div>
  );
}

/* === BRANDED LOGIN STYLES === */
const pageWrapper = { backgroundColor: "#0A0C0B", color: "#E0E7E5", minHeight: "100vh", fontFamily: "'Nunito Sans', sans-serif", display: "flex", flexDirection: "column" as const };
const navBarStyle = { height: "100px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px", borderBottom: "1px solid rgba(255,255,255,0.05)" };
const logoStyle = { fontFamily: "'Gilda Display', serif", fontSize: "22px", letterSpacing: "3px", color: "var(--aura-gold)" };
const backLink = { fontSize: "12px", color: "#94A39F", textDecoration: "none", fontWeight: 700, letterSpacing: "1px" };

const loginSection = { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" };
const loginCard = { width: "100%", maxWidth: "460px", backgroundColor: "#141615", padding: "60px", borderRadius: "6px", border: "1px solid rgba(197, 160, 89, 0.2)" };

const auraBadge = { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "rgba(197, 160, 89, 0.1)", color: "var(--aura-gold)", borderRadius: "6px", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", marginBottom: "32px", width: 'fit-content', margin: '0 auto 32px' };
const titleStyle = { textAlign: 'center' as const, fontFamily: "'Gilda Display', serif", fontSize: "36px", marginBottom: "12px", letterSpacing: "2px" };
const subtitleStyle = { textAlign: 'center' as const, fontSize: "14px", color: "#94A39F", marginBottom: "48px" };

const errorBanner = { backgroundColor: "rgba(255, 100, 100, 0.1)", color: "#FF6B6B", padding: "12px", borderRadius: "6px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(255, 100, 100, 0.2)" };
const formStyle = { display: "flex", flexDirection: "column" as const, gap: "24px" };
const inputGroup = { textAlign: "left" as const };
const labelStyle = { fontSize: "10px", fontWeight: "800", color: "#666", letterSpacing: "1.5px", marginBottom: "10px", display: "block" };
const forgotLink = { fontSize: "10px", color: "var(--aura-gold)", textDecoration: "none", fontWeight: 700 };

const inputWrapper = { position: "relative" as const, display: "flex", alignItems: "center" };
const iconStyle = { position: "absolute" as const, left: "15px", color: "rgba(197, 160, 89, 0.5)" };
const inputField = { width: "100%", padding: "18px 18px 18px 50px", backgroundColor: "#0A0C0B", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", color: "#FFF", fontSize: "15px", outline: "none" };

const primaryBtn = { cursor: 'pointer', border: 'none', padding: "20px", backgroundColor: "var(--aura-gold)", color: "#112620", borderRadius: "6px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontSize: "14px", marginTop: "10px", transition: 'opacity 0.2s' };

const socialProof = { fontSize: "11px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "32px" };

/* === HIGH-VISIBILITY FOOTER === */
const footerStyle = { padding: "60px 40px", textAlign: "center" as const, borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#080A09" };
const footerDivider = { width: "40px", height: "1px", backgroundColor: "var(--aura-gold)", margin: "0 auto 30px", opacity: 0.5 };
const footerBranding = { fontSize: "11px", color: "#94A39F", letterSpacing: "1px", marginBottom: "8px" };
const taigenicBranding = { fontSize: "13px", color: "#E0E7E5", letterSpacing: "2px", fontWeight: 500 };