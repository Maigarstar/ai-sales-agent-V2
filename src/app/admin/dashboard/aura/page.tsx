"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "src/lib/supabase/client";
import { Sparkles, Radio, ShieldCheck, MapPin, Calendar } from "lucide-react";

type Lead = {
  id: string;
  client_name: string;
  location: string;
  wedding_date: string;
  message: string;
  match_score: number;
};

export default function AuraNeuralFeed() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("vendor_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) setLeads(data as Lead[]);
    };
    fetchLeads();

    const channel = supabase
      .channel("vendor_leads_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vendor_leads" },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div style={auraCanvas}>
      <div style={contentWrapper}>
        <div style={headerRow}>
          <div>
            <h1 style={gildaTitle}>AURA CONCIERGE</h1>
            <div style={statusBadge}>
              <Radio size={12} className="animate-pulse" /> 
              <span>LIVE NEURAL MONITORING</span>
            </div>
          </div>
        </div>

        <div style={feedContainer}>
          <h3 style={sectionLabel}>RECENT INTERCEPTS</h3>

          {leads.length === 0 ? (
            <div style={pulseLoader}>
              <Sparkles size={24} color="#18342e" style={{ opacity: 0.2 }} />
              <p style={loaderText}>
                Aura is scanning luxury enquiries for your brand signature...
              </p>
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} style={interceptCard}>
                <div style={cardHeader}>
                  <div style={profileCircle}>
                    {lead.client_name?.substring(0, 2).toUpperCase() || "AA"}
                  </div>
                  <div style={interceptInfo}>
                    <div style={clientName}>
                      {lead.client_name} — Highly Qualified
                    </div>
                    <div style={interceptMeta}>
                      <MapPin size={12} /> {lead.location} • <Calendar size={12} />{" "}
                      {lead.wedding_date}
                    </div>
                  </div>
                  <div style={matchScore}>{lead.match_score}% Match</div>
                </div>

                <div style={transcriptPreview}>{lead.message}</div>

                <div style={cardFooter}>
                  <div style={secureTag}>
                    <ShieldCheck size={14} color="#a58a32" /> Encrypted Identity
                  </div>
                  <button style={engageBtn}>Initialize Engagement</button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer style={footerBranding}>
          <div style={fullTitle}>5 STAR WEDDINGS</div>
          <div style={tagline}>THE LUXURY WEDDING COLLECTION — EST. 2026</div>
        </footer>
      </div>
    </div>
  );
}

/* === Branded Neural Styles === */
const auraCanvas = {
  backgroundColor: "#faf7f6", // ✅ your preferred base background
  minHeight: "100vh",
  width: "100%",
};

const contentWrapper = {
  padding: "60px 40px",
  background: "transparent", // ✅ removed dull overlay
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "48px",
};

const gildaTitle = {
  fontFamily: "'Gilda Display', serif",
  fontSize: "36px",
  color: "#18342e",
};

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "12px",
  color: "#a58a32",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const feedContainer = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
};

const sectionLabel = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#18342e",
  opacity: 0.3,
  letterSpacing: "2px",
  marginBottom: "10px",
};

const interceptCard = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  border: "1px solid #eef2f1",
  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "24px",
};

const profileCircle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "#f4f7f6",
  color: "#18342e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "14px",
};

const interceptInfo = { flex: 1 };
const clientName = { fontSize: "16px", fontWeight: 700, color: "#18342e" };
const interceptMeta = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "12px",
  color: "#282828",
  opacity: 0.5,
  marginTop: "4px",
};

const matchScore = {
  backgroundColor: "rgba(165, 138, 50, 0.1)",
  color: "#a58a32",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 800,
};

const transcriptPreview = {
  backgroundColor: "#f9fbfb",
  padding: "20px",
  borderRadius: "12px",
  fontSize: "14px",
  color: "#18342e",
  lineHeight: "1.6",
  fontStyle: "italic",
  marginBottom: "24px",
  borderLeft: "3px solid #a58a32",
};

const cardFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const secureTag = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#a58a32",
};

const engageBtn = {
  backgroundColor: "#18342e",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: 700,
  fontSize: "13px",
  cursor: "pointer",
};

const pulseLoader = {
  textAlign: "center" as const,
  padding: "80px 0",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "16px",
};

const loaderText = {
  fontSize: "13px",
  color: "#18342e",
  opacity: 0.4,
  fontWeight: 600,
  letterSpacing: "0.5px",
};

const footerBranding = {
  marginTop: "80px",
  textAlign: "center" as const,
  backgroundColor: "#e7ebe2", // ✅ your new footer tone
  padding: "24px",
  borderRadius: "12px",
};

const fullTitle = {
  fontSize: "13px",
  letterSpacing: "4px",
  color: "#18342e",
  fontWeight: 800,
};

const tagline = {
  fontSize: "10px",
  color: "#a58a32",
  letterSpacing: "2.5px",
  marginTop: "6px",
  fontWeight: 700,
};
