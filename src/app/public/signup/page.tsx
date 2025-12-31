"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "src/lib/supabase/client";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: "vendor", // Defaulting new signups to vendor for your engine
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Logic for email confirmation or auto-login goes here
      window.location.href = "/vendors/onboarding";
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Join Aura</h1>
          <p style={subtitleStyle}>Empower your business with Taigenic AI.</p>
        </div>

        <form onSubmit={handleSignup} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={inputWrapper}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              required
              placeholder="Alexander West"
              style={inputStyle}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={inputWrapper}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@luxuryestates.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={inputWrapper}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating Account..." : "Create Merchant Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={footerLinkStyle}>
          Already have an account? <Link href="/login" style={{ color: "#183F34", fontWeight: "600" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" };
const formCardStyle = { width: "100%", maxWidth: "420px", padding: "40px", backgroundColor: "#fff", borderRadius: "24px", border: "1px solid #f0f0f0", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" };
const headerStyle = { textAlign: "center" as "center", marginBottom: "32px" };
const titleStyle = { fontFamily: "Gilda Display, serif", fontSize: "32px", color: "#183F34", marginBottom: "8px" };
const subtitleStyle = { color: "#777", fontSize: "14px" };
const formStyle = { display: "flex", flexDirection: "column" as "column", gap: "20px" };
const inputWrapper = { display: "flex", flexDirection: "column" as "column", gap: "6px" };
const labelStyle = { fontSize: "12px", fontWeight: "600", textTransform: "uppercase" as "uppercase", color: "#aaa", letterSpacing: "1px" };
const inputStyle = { padding: "12px 16px", borderRadius: "10px", border: "1px solid #eee", fontSize: "15px", outline: "none", backgroundColor: "#fafafa" };
const buttonStyle = { padding: "14px", backgroundColor: "#183F34", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px" };
const errorStyle = { padding: "12px", backgroundColor: "#fff5f5", color: "#c53030", borderRadius: "8px", fontSize: "13px", border: "1px solid #feb2b2" };
const footerLinkStyle = { textAlign: "center" as "center", marginTop: "24px", fontSize: "14px", color: "#666" };