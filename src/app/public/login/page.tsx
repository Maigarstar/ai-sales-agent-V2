"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "src/lib/supabase/client";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <div style={headerStyle}>
          <h2 style={brandStyle}>5 Star Weddings</h2>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Powered by Taigenic.ai Engine</p>
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          
          <div style={inputWrapper}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
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
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p style={footerLinkStyle}>
          New to the network? <Link href="/signup" style={linkHighlight}>Apply as a Vendor</Link>
        </p>
      </div>
    </div>
  );
}

const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" };
const formCardStyle = { width: "100%", maxWidth: "400px", padding: "40px", backgroundColor: "#fff", borderRadius: "24px", border: "1px solid #f0f0f0" };
const headerStyle = { textAlign: "center" as "center", marginBottom: "32px" };
const brandStyle = { fontSize: "12px", textTransform: "uppercase" as "uppercase", letterSpacing: "2px", color: "#999", marginBottom: "8px" };
const titleStyle = { fontFamily: "Gilda Display, serif", fontSize: "32px", color: "#183F34" };
const subtitleStyle = { fontSize: "11px", color: "#bbb", marginTop: "4px" };
const formStyle = { display: "flex", flexDirection: "column" as "column", gap: "20px" };
const inputWrapper = { display: "flex", flexDirection: "column" as "column", gap: "6px" };
const labelStyle = { fontSize: "11px", fontWeight: "600", color: "#aaa", textTransform: "uppercase" as "uppercase" };
const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #eee", fontSize: "14px", backgroundColor: "#fafafa" };
const buttonStyle = { padding: "14px", backgroundColor: "#183F34", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };
const errorStyle = { padding: "10px", backgroundColor: "#fff5f5", color: "#c53030", borderRadius: "6px", fontSize: "12px" };
const footerLinkStyle = { textAlign: "center" as "center", marginTop: "24px", fontSize: "13px", color: "#666" };
const linkHighlight = { color: "#183F34", fontWeight: "600", textDecoration: "none" };