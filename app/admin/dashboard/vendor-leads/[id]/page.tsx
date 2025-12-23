"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { createClient } from "@/lib/supabase/client";
import {
  Mail, Phone, MapPin, Send, Loader2, UserCheck, LogOut, ArrowLeft, Sparkles, ShieldCheck
} from "lucide-react";
import AuraVoice from "@/components/AuraVoice";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function LeadControlRoom() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isHuman, setIsHuman] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = {
    canvas: "#FAF7F6",
    surface: "#FFFFFF",
    primaryText: "#2E2B28", // Refined Charcoal Taupe
    corporateGreen: "#18342E", // Your Brand Green
    accentGold: "#C5A059",  // Champagne Gold
    border: "#EAE7E3",      // Soft Linen Beige
    textMuted: "#6F6A67"    // Elegant Muted Brown-Grey
  };

  useEffect(() => {
    if (!id) return;
    loadLead();
  }, [id]);

  async function loadLead() {
    setLoading(true);
    const { data: leadData } = await supabase.from("vendor_leads").select("*").eq("id", id).single();
    const { data: chatData } = await supabase.from("chat_messages").select("*").eq("lead_id", id).order("created_at", { ascending: true });
    setLead(leadData);
    setMessages(chatData || []);
    setIsHuman(leadData?.is_human_takeover || false);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: brand.canvas, padding: "60px 80px", fontFamily: "'Nunito Sans', sans-serif" }}>
      
      {/* 1. ELITE HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
        <div>
          <button onClick={() => router.back()} style={btnGhost}>
            <ArrowLeft size={16} /> Back to Hub
          </button>
          <h1 style={{ fontFamily: "'Gilda Display', serif", fontSize: "42px", color: brand.primaryText, margin: "12px 0 4px" }}>
            {lead?.client_name || "Lead Intercept"}
          </h1>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: brand.accentGold }}>
            <span>MATCH SCORE: {lead?.match_score || "94"}%</span>
            <span>STATUS: {lead?.lead_status?.toUpperCase() || "ENGAGING"}</span>
          </div>
        </div>
        
        {/* UPDATED BUTTONS */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={btnOutline(brand.corporateGreen)}>
            <Mail size={16} /> Send Document
          </button>
          <button onClick={() => setIsHuman(!isHuman)} style={btnSolid(brand.corporateGreen)}>
            {isHuman ? <LogOut size={16} /> : <UserCheck size={16} />}
            {isHuman ? "End Takeover" : "Initialize Human Takeover"}
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px" }}>
        
        {/* LEFT COLUMN: COMMUNICATION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <section style={insightCard(brand.accentGold)}>
            <Sparkles size={20} color={brand.accentGold} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: brand.primaryText, marginBottom: "4px" }}>Aura Intelligence Summary</p>
              <p style={{ fontSize: "14px", color: brand.textMuted, fontStyle: "italic" }}>
                "{lead?.ai_summary || "Analyzing client investment signature..."}"
              </p>
            </div>
          </section>

          <section style={cardStyle(brand.border)}>
            <h2 style={cardTitle(brand.primaryText)}>Live Conversation</h2>
            <div style={chatBox(brand.canvas, brand.border)}>
              {messages.map((msg) => (
                <div key={msg.id} style={msg.role === "admin" ? outgoingMsg(brand.corporateGreen) : incomingMsg(brand.canvas, brand.border, brand.primaryText)}>
                  <p style={{ margin: 0 }}>{msg.message}</p>
                </div>
              ))}
            </div>
            <div style={inputArea}>
              <input 
                placeholder={isHuman ? "Compose bespoke response..." : "Initialize Takeover to reply"} 
                disabled={!isHuman} 
                style={chatInput(isHuman, brand.border, brand.primaryText)} 
              />
              <button disabled={!isHuman} style={isHuman ? btnIcon(brand.corporateGreen) : btnDisabled}>
                <Send size={16} />
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: DATA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <section style={cardStyle(brand.border)}>
            <h3 style={cardTitleSmall(brand.primaryText)}>Intercept Details</h3>
            <DetailItem icon={<Mail size={14}/>} label="Email" value={lead?.contact_email} color={brand.accentGold} />
            <DetailItem icon={<Phone size={14}/>} label="Phone" value={lead?.contact_phone} color={brand.accentGold} />
            <DetailItem icon={<MapPin size={14}/>} label="Location" value={lead?.location} color={brand.accentGold} />
          </section>
          
          <section style={cardStyle(brand.border)}>
            <h3 style={cardTitleSmall(brand.primaryText)}>Sync Status</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 800, color: brand.primaryText }}>
              <ShieldCheck size={14} color={brand.accentGold} />
              NEURAL SYNC SECURE
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* === BRANDED COMPONENT STYLES === */
const btnSolid = (color: string) => ({ backgroundColor: color, color: "#FFF", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: 700, fontSize: "13px", display: "flex", gap: "8px", alignItems: "center", cursor: "pointer" });
const btnOutline = (color: string) => ({ backgroundColor: "transparent", color: color, border: `1px solid ${color}`, borderRadius: "8px", padding: "12px 24px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", gap: "8px" });
const btnIcon = (color: string) => ({ backgroundColor: color, color: "#FFF", border: "none", borderRadius: "8px", width: "44px", height: "44px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" });
const btnDisabled = { backgroundColor: "#EAE7E3", color: "#AAA", border: "none", borderRadius: "8px", width: "44px", height: "44px", cursor: "not-allowed" };
const btnGhost = { background: "none", border: "none", color: "#6F6A67", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", gap: "8px", alignItems: "center", padding: 0 };

const cardStyle = (border: string) => ({ backgroundColor: "#FFF", borderRadius: "24px", padding: "32px", border: `1px solid ${border}`, boxShadow: "0 10px 30px rgba(46, 43, 40, 0.03)" });
const insightCard = (gold: string) => ({ backgroundColor: `${gold}0D`, borderRadius: "16px", padding: "24px", display: "flex", gap: "16px", border: `1px solid ${gold}33` });
const cardTitle = (color: string) => ({ fontFamily: "'Gilda Display', serif", fontSize: "24px", color, marginBottom: "24px" });
const cardTitleSmall = (color: string) => ({ fontFamily: "'Gilda Display', serif", fontSize: "18px", color, marginBottom: "16px" });

const chatBox = (bg: string, border: string) => ({ height: "400px", overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: "12px", paddingRight: "10px" });
const incomingMsg = (bg: string, border: string, text: string) => ({ alignSelf: "flex-start", backgroundColor: bg, padding: "12px 18px", borderRadius: "0 12px 12px 12px", fontSize: "14px", color: text, maxWidth: "80%", border: `1px solid ${border}` });
const outgoingMsg = (green: string) => ({ alignSelf: "flex-end", backgroundColor: green, padding: "12px 18px", borderRadius: "12px 12px 0 12px", fontSize: "14px", color: "#FFF", maxWidth: "80%" });

const inputArea = { display: "flex", gap: "12px", marginTop: "24px", alignItems: "center" };
const chatInput = (active: boolean, border: string, text: string) => ({ flex: 1, padding: "14px 20px", borderRadius: "10px", border: `1px solid ${border}`, fontSize: "14px", outline: "none", backgroundColor: active ? "#FFF" : "#F5F5F5", color: text });

function DetailItem({ icon, label, value, color }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: "13px" }}>
        <span style={{ color: "#6F6A67", fontWeight: 600 }}>{label}: </span>
        <span style={{ color: "#2E2B28", fontWeight: 700 }}>{value || "Pending"}</span>
      </div>
    </div>
  );
}