"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, UserPlus, Trash2, Mic, Settings } from "lucide-react";
import { createClient } from "src/lib/supabase/client";

/* =========================================================
   LUXURY CHAT COMPONENT
   ========================================================= */
export default function ConciergeInterface({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const organisationId = searchParams.get("organisationId") || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
  const agentId = searchParams.get("agentId") || "70660422-489c-4b7d-81ae-b786e43050db";

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = "Hello, I am Aura. I am the voice of your Taigenic AI assistant for 5 Star Weddings. I help elite professionals refine their positioning and manage high-value inquiries. How can I assist you today?";

  useEffect(() => {
    const saved = localStorage.getItem("fsw_active_chat");
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.messages || []);
    } else {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (messages.length > 0) {
      localStorage.setItem("fsw_active_chat", JSON.stringify({ messages }));
    }
  }, [messages]);

  const handleSend = async (manualInput?: string) => {
    const text = manualInput || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, organisationId, agentId }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error("Taigenic Engine Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={chatContainer}>
      {/* Editorial Header */}
      <header style={headerStyle}>
        <div style={brandLockup}>
          <div style={brandName}>5 STAR WEDDINGS</div>
          <div style={engineLabel}>POWERED BY TAIGENIC.AI</div>
        </div>
        <div style={personaBadge}>
          <Sparkles size={14} color="#C5A059" />
          <span style={{ color: "#C5A059", fontWeight: "600", letterSpacing: "1px" }}>AURA VOICE ACTIVE</span>
        </div>
      </header>

      {/* Message Feed */}
      <div ref={scrollRef} style={feedStyle}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              ...messageRow, 
              justifyContent: m.role === "user" ? "flex-end" : "flex-start" 
            }}>
              {m.role === "assistant" && <div style={auraAvatar}>5*</div>}
              <div style={{
                ...bubbleStyle,
                backgroundColor: m.role === "user" ? "#183F34" : "#FFFFFF",
                color: m.role === "user" ? "#FFFFFF" : "#112620",
                border: m.role === "assistant" ? "1px solid #E2C58A" : "none",
                borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              }}>
                <div style={{ fontSize: "15px", lineHeight: "1.6" }}>{m.content}</div>
              </div>
            </div>
          ))}
          {loading && <div style={loadingText}>Aura is composing...</div>}
        </div>
      </div>

      {/* Luxury Input Console */}
      <footer style={footerStyle}>
        <div style={inputConsole}>
          <input
            style={textInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your enquiry or ask Aura for business guidance..."
          />
          <div style={actionTray}>
            <button style={iconBtn}><Mic size={18} /></button>
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim()} 
              style={sendBtn}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div style={legalFooter}>
          © 5 STAR WEDDINGS LTD • ENGINE BY TAIGENIC.AI • DATA SECURED
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   THEME CONSTANTS (LIGHT & DARK COMPATIBLE)
   ========================================================= */
const chatContainer = { display: "flex", flexDirection: "column" as "column", height: "100vh", backgroundColor: "#FDFCFB" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 40px", borderBottom: "1px solid rgba(197, 160, 89, 0.2)", backgroundColor: "#FFFFFF" };
const brandLockup = { display: "flex", flexDirection: "column" as "column" };
const brandName = { fontFamily: "var(--font-gilda)", fontSize: "20px", color: "#112620", letterSpacing: "2px", fontWeight: "600" };
const engineLabel = { fontSize: "9px", color: "#C5A059", letterSpacing: "2px", marginTop: "4px" };
const personaBadge = { display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", backgroundColor: "#112620", padding: "8px 16px", borderRadius: "20px" };

const feedStyle = { flex: 1, overflowY: "auto" as "auto", padding: "40px", display: "flex", flexDirection: "column" as "column" };
const messageRow = { display: "flex", marginBottom: "24px", alignItems: "flex-end", gap: "12px" };
const auraAvatar = { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#112620", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "var(--font-gilda)", border: "1px solid #C5A059" };
const bubbleStyle = { maxWidth: "70%", padding: "18px 24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" };

const footerStyle = { padding: "32px 40px", backgroundColor: "#FFFFFF", borderTop: "1px solid #EEEEEE" };
const inputConsole = { maxWidth: "800px", margin: "0 auto", position: "relative" as "relative", display: "flex", alignItems: "center" };
const textInput = { width: "100%", padding: "18px 120px 18px 24px", borderRadius: "30px", border: "1px solid #E2C58A", backgroundColor: "#FDFCFB", fontSize: "15px", outline: "none", color: "#112620" };
const actionTray = { position: "absolute" as "absolute", right: "8px", display: "flex", gap: "8px" };
const iconBtn = { background: "none", border: "none", color: "#C5A059", cursor: "pointer", padding: "8px" };
const sendBtn = { backgroundColor: "#112620", color: "#C5A059", border: "none", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const loadingText = { textAlign: "center" as "center", fontSize: "12px", color: "#C5A059", letterSpacing: "1px", marginY: "20px" };
const legalFooter = { textAlign: "center" as "center", fontSize: "9px", color: "#AAA", letterSpacing: "1.5px", marginTop: "20px", textTransform: "uppercase" as "uppercase" };