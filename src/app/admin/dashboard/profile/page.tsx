"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Mail,
  Globe,
  Phone,
  Building2,
  Sparkles,
  Camera,
} from "lucide-react";

import { createBrowserSupabase } from "@/lib/supabase/browser";

/* =========================================================
   SHARP LUXURY PROFILE
========================================================= */
export default function VendorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createBrowserSupabase();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [supabase]);

  const saveProfile = async () => {
    if (!profile?.id) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", profile.id);

    setMessage(error ? "Sync Error" : "Knowledge Base Updated");
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="p-20 text-center luxury-serif">
        Synchronizing...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <header
        style={{
          marginBottom: "48px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--aura-gold)",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          <ShieldCheck size={14} /> Identity Management
        </div>

        <h1
          className="luxury-serif"
          style={{
            fontSize: "42px",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Business Profile
        </h1>

        <p style={{ color: "#666", fontSize: "14px" }}>
          Manage the parameters Aura uses to represent your brand.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "32px",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <section style={cardStyle}>
            <h3
              className="luxury-serif"
              style={{ fontSize: "20px", marginBottom: "24px" }}
            >
              Brand Foundation
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={inputGroup}>
                <label style={labelStyle}>Legal Name</label>
                <input
                  style={inputStyle}
                  value={profile?.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Company Name</label>
                <input
                  style={inputStyle}
                  value={profile?.company_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, company_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Company Bio</label>
              <textarea
                style={{ ...inputStyle, height: "120px", resize: "none" }}
                value={profile?.about || ""}
                onChange={(e) =>
                  setProfile({ ...profile, about: e.target.value })
                }
              />
            </div>
          </section>

          <section
            style={{
              ...cardStyle,
              backgroundColor: "#112620",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <Sparkles size={18} color="var(--aura-gold)" />
              <h3
                className="luxury-serif"
                style={{ fontSize: "20px", color: "var(--aura-gold)" }}
              >
                Aura Intelligence
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div style={inputGroup}>
                <label style={{ ...labelStyle, color: "rgba(255,255,255,0.5)" }}>
                  Luxury Tier
                </label>
                <select
                  style={darkInputStyle}
                  value={profile?.luxury_tier || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, luxury_tier: e.target.value })
                  }
                >
                  <option>High-End</option>
                  <option>Ultra-Luxury</option>
                  <option>Bespoke</option>
                </select>
              </div>

              <div style={inputGroup}>
                <label style={{ ...labelStyle, color: "rgba(255,255,255,0.5)" }}>
                  Starting Price (£)
                </label>
                <input
                  type="number"
                  style={darkInputStyle}
                  value={profile?.starting_price || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      starting_price: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <section style={{ ...cardStyle, textAlign: "center" }}>
            <label
              style={{
                ...labelStyle,
                marginBottom: "16px",
                display: "block",
              }}
            >
              Brand Mark
            </label>

            <div style={logoContainer}>
              {profile?.company_logo ? (
                <Image
                  src={profile.company_logo}
                  alt="Logo"
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Building2 size={40} color="#EEE" />
              )}
              <div style={uploadOverlay}>
                <Camera size={16} />
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <h3
              className="luxury-serif"
              style={{ fontSize: "18px", marginBottom: "20px" }}
            >
              Connectivity
            </h3>

            <div style={contactRow}>
              <Mail size={14} color="var(--aura-gold)" /> {profile?.email}
            </div>

            <div style={contactRow}>
              <Globe size={14} color="var(--aura-gold)" />{" "}
              {profile?.website || "Website not set"}
            </div>

            <div style={contactRow}>
              <Phone size={14} color="var(--aura-gold)" />{" "}
              {profile?.phone || "Phone not set"}
            </div>
          </section>
        </div>
      </div>

      <div
        style={{
          marginTop: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button onClick={saveProfile} disabled={saving} style={saveBtn}>
          {saving ? "Updating Engine..." : "Sync Knowledge Base"}
        </button>

        {message && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--aura-gold)",
              fontWeight: "600",
              letterSpacing: "1px",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */
const cardStyle = {
  padding: "32px",
  backgroundColor: "#fff",
  border: "1px solid var(--border)",
  borderRadius: "6px",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
};

const labelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#AAA",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  border: "1px solid #EEE",
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "#FAFAFA",
  outline: "none",
};

const darkInputStyle = {
  ...inputStyle,
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
};

const logoContainer = {
  width: "120px",
  height: "120px",
  margin: "0 auto",
  borderRadius: "6px",
  backgroundColor: "#FAFAFA",
  border: "1px solid #EEE",
  position: "relative" as const,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const uploadOverlay = {
  position: "absolute" as const,
  bottom: 0,
  width: "100%",
  padding: "8px",
  background: "rgba(0,0,0,0.4)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  cursor: "pointer",
};

const contactRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "13px",
  color: "#666",
  padding: "12px",
  backgroundColor: "#FAFAFA",
  borderRadius: "6px",
  marginBottom: "8px",
};

const saveBtn = {
  padding: "16px 40px",
  backgroundColor: "#112620",
  color: "var(--aura-gold)",
  border: "1px solid var(--aura-gold)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  cursor: "pointer",
};
