"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Send, X, Sparkles, User } from "lucide-react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function SmartEmailComposer({ lead, messages, onClose, onSent }: any) {
  // 1. Auto-Fill Subject Line using Lead Details
  const [subject, setSubject] = useState(`Bespoke Proposal for ${lead?.client_name || "Your Special Day"}`);
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 2. Effect to generate the "Neural Draft" on mount
  useEffect(() => {
    generateNeuralDraft();
  }, [lead, messages]);

  const generateNeuralDraft = () => {
    // We construct the HTML body using Lead Details and AI Summary
    const clientFirstName = lead?.client_name?.split(' ')[0] || "there";
    const aiInsight = lead?.ai_summary || "your unique vision for the day.";
    
    const draft = `
      <p>Dear ${clientFirstName},</p>
      <p>It was a pleasure connecting with you through our concierge. Based on our initial conversation regarding <strong>${lead?.location || "your upcoming celebration"}</strong>, I am delighted to share some bespoke details.</p>
      <p>Aura mentioned that you are specifically looking for: <em>"${aiInsight}"</em></p>
      <p>At <strong>5 Star Weddings</strong>, we specialize in exactly this level of exclusivity. I have personally reviewed your requirements and would love to discuss how we can bring this vision to life.</p>
      <p>Best regards,<br/><strong>The Boutique Team</strong></p>
    `;
    setBody(draft);
  };

  const brand = { green: "#18342E", ivory: "#FAF7F6", gold: "#C5A059", border: "#EAE7E3" };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <div>
            <div style={badge}><Sparkles size={10} /> NEURAL DRAFT ACTIVE</div>
            <h2 style={gildaTitle}>Bespoke Dispatch</h2>
            <p style={subLabel}>Recipient: {lead?.contact_email}</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        </div>

        <div style={composerBody}>
          <div style={inputGroup}>
            <label style={labelStyle}>Subject Line</label>
            <input style={textInput} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div style={editorContainer}>
            <div style={editorHeader}>
              <label style={labelStyle}>HTML Proposal Content</label>
              <button onClick={generateNeuralDraft} style={resetBtn}>Reset to Neural Draft</button>
            </div>
            <ReactQuill theme="snow" value={body} onChange={setBody} style={{ height: "300px", marginBottom: "50px" }} />
          </div>
        </div>

        <div style={modalFooter}>
          <div style={contactCheck}>
            <User size={14} color="#C5A059" /> 
            <span>Verified Contact: {lead?.contact_phone || "No Phone Provided"}</span>
          </div>
          <button onClick={() => onSent(body)} style={btnSolid(brand.green)}>
            <Send size={16} /> Dispatch Bespoke Email
          </button>
        </div>
      </div>
    </div>
  );
}

/* === BRANDED STYLES === */
const overlayStyle = { position: "fixed" as const, inset: 0, backgroundColor: "rgba(24, 52, 46, 0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { backgroundColor: "#FFF", width: "100%", maxWidth: "850px", borderRadius: "32px", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.2)" };
const modalHeader = { padding: "32px 40px", borderBottom: "1px solid #EAE7E3", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF7F6" };
const badge = { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#C5A059", color: "#FFF", padding: "4px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 800, letterSpacing: "1px", marginBottom: "8px" };
const gildaTitle = { fontFamily: "'Gilda Display', serif", fontSize: "28px", color: "#18342E", margin: 0 };
const subLabel = { fontSize: "12px", color: "#6F6A67", fontWeight: 700, marginTop: "4px" };

const composerBody = { padding: "40px" };
const labelStyle = { display: "block", fontSize: "10px", fontWeight: 800, color: "#18342E", letterSpacing: "1.5px", textTransform: "uppercase" as const };
const textInput = { width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #EAE7E3", outline: "none", fontSize: "15px", marginBottom: "24px", color: "#2E2B28", marginTop: "12px" };
const editorContainer = { minHeight: "380px" };
const editorHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" };
const resetBtn = { background: "none", border: "none", color: "#C5A059", fontSize: "11px", fontWeight: 800, cursor: "pointer", textDecoration: "underline" };

const modalFooter = { padding: "32px 40px", borderTop: "1px solid #EAE7E3", display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtn = { background: "none", border: "none", color: "#18342E", cursor: "pointer" };
const contactCheck = { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#6F6A67", fontWeight: 700 };
const btnSolid = (color: string) => ({ backgroundColor: color, color: "#FFF", border: "none", borderRadius: "12px", padding: "16px 32px", fontWeight: 700, fontSize: "14px", display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" });