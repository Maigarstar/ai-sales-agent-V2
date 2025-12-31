"use client";

import React from "react";
import { Send, User, ShieldCheck, Sparkles } from "lucide-react";

export default function LiveChatPage() {
  return (
    <div style={chatCanvas}>
      {/* Active Lead Header */}
      <div style={chatHeader}>
        <div style={clientProfile}>
          <div style={avatar}>SC</div>
          <div>
            <div style={clientName}>Sophie & Charles</div>
            <div style={statusText}>Aura Intelligence: 94% Match</div>
          </div>
        </div>
        <div style={encryptionBadge}>
          <ShieldCheck size={14} /> SECURED CONNECTION
        </div>
      </div>

      {/* Message Feed */}
      <div style={messageArea}>
        <div style={aiMessage}>
          <Sparkles size={14} color="#a58a32" />
          <span>Aura: "The couple is interested in a 3-day buyout for August 2026. 
          They have a confirmed investment floor of £150k."</span>
        </div>
        
        {/* Real User Messages would map here */}
      </div>

      {/* Input Zone */}
      <div style={inputZone}>
        <input 
          type="text" 
          placeholder="Type your bespoke response..." 
          style={chatInput} 
        />
        <button style={sendBtn}><Send size={18} /></button>
      </div>
    </div>
  );
}

/* === BRANDED CHAT STYLES === */
const chatCanvas = { height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" as const, backgroundColor: "#ffffff" };
const chatHeader = { padding: "20px 40px", borderBottom: "1px solid #e7e6e2", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f4f7f6" };
const clientProfile = { display: "flex", alignItems: "center", gap: "16px" };
const avatar = { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#18342e", color: "#a58a32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" };
const clientName = { color: "#18342e", fontWeight: 700, fontSize: "16px" };
const statusText = { color: "#a58a32", fontSize: "11px", fontWeight: 800, letterSpacing: "0.5px" };
const encryptionBadge = { fontSize: "10px", color: "#18342e", opacity: 0.4, fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" };

const messageArea = { flex: 1, padding: "40px", overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: "20px" };
const aiMessage = { alignSelf: "center", backgroundColor: "#f4f7f6", padding: "12px 24px", borderRadius: "12px", border: "1px solid #e7e6e2", fontSize: "13px", color: "#18342e", display: "flex", alignItems: "center", gap: "12px", fontStyle: "italic" };

const inputZone = { padding: "30px 40px", borderTop: "1px solid #e7e6e2", display: "flex", gap: "20px" };
const chatInput = { flex: 1, padding: "16px", borderRadius: "8px", border: "1px solid #e7e6e2", outline: "none", fontSize: "14px", color: "#18342e" };
const sendBtn = { backgroundColor: "#18342e", color: "#ffffff", border: "none", padding: "0 24px", borderRadius: "8px", cursor: "pointer" };