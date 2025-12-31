"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles, Send, User, Mic, AudioLines, RefreshCw } from "lucide-react";

export default function AuraLiveSimulation() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "aura"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  useEffect(() => {
    setMounted(true);
    const fetchAuraConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setMessages([
          {
            role: "aura",
            text: `Good afternoon. I’m Aura, your wedding specialist for ${
              data?.company_name || "5 Star Weddings"
            }. How may I assist you today?`,
          },
        ]);
      }
    };
    fetchAuraConfig();
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "aura",
          text: "I’ve noted your request and am aligning it with our luxury standards.",
        },
      ]);
    }, 1200);
  };

  if (!mounted) return null;

  const isInputActive = input.length > 0;
  const sendButtonColor = isInputActive ? "#183F34" : "#C8CFC9";

  return (
    <div style={container}>
      <header style={header}>
        <div>
          <div style={badge}>
            <Sparkles size={12} /> Aura Intelligence
          </div>
          <h1 style={title}>Interface Test</h1>
        </div>
        <button onClick={() => window.location.reload()} style={resetBtn}>
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      <div style={chatBox} ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "aura" ? auraRow : userRow}>
            <div style={msg.role === "aura" ? specialistIcon : userIcon}>
              {msg.role === "aura" ? (
                <span style={goldStar}>★</span>
              ) : (
                <User size={16} color="#FFF" />
              )}
            </div>
            <div style={msg.role === "aura" ? auraBubble : userBubble}>{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div style={{ marginLeft: "48px", color: "#C8A165", fontSize: "13px" }}>
            Aura is thinking...
          </div>
        )}
      </div>

      <div style={inputSectionWrapper}>
        <div style={pillInputContainer}>
          <input
            style={pillField}
            placeholder="Message Aura about your wedding..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <div style={actionButtons}>
            <button style={circleBtn} className="aura-icon">
              <Mic size={18} color="#183F34" />
            </button>
            <button style={circleBtn} className="aura-icon">
              <AudioLines size={18} color="#183F34" />
            </button>
            <button
              onClick={handleSendMessage}
              style={{
                ...circleBtn,
                backgroundColor: sendButtonColor,
                border: "none",
              }}
              className="aura-icon"
            >
              <Send size={16} color="#FFF" />
            </button>
          </div>
        </div>

        <div style={footerMeta}>
          <div style={tipText}>
            Tip, open anytime: <span style={linkHighlight}>5starweddingdirectory.com</span>
          </div>
          <div style={createAccountText}>Create account</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLING ENGINE: GOLD STAR + ROUND ICONS
   ========================================================= */
const container = {
  height: "calc(100vh - 120px)",
  display: "flex",
  flexDirection: "column" as const,
  fontFamily: "'Gilda Display', serif",
  background: "#FAFAF9",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "32px",
};
const badge = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: "#C8A165",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};
const title = {
  fontSize: "32px",
  color: "#183F34",
  marginTop: "8px",
};

const chatBox = {
  flex: 1,
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
  padding: "20px 0",
};
const auraRow = { display: "flex", gap: "12px", alignSelf: "flex-start", maxWidth: "80%" };
const userRow = {
  display: "flex",
  gap: "12px",
  alignSelf: "flex-end",
  flexDirection: "row-reverse" as const,
  maxWidth: "80%",
};

const auraBubble = {
  backgroundColor: "#F3F4F6",
  color: "#2D312F",
  padding: "14px 20px",
  borderRadius: "20px 20px 20px 4px",
  fontSize: "15px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};
const userBubble = {
  backgroundColor: "#183F34",
  color: "#FFF",
  padding: "14px 20px",
  borderRadius: "20px 20px 4px 20px",
  fontSize: "15px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const specialistIcon = {
  width: "40px",
  height: "40px",
  backgroundColor: "#FFF",
  borderRadius: "50%",
  border: "1px solid #C8A165",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const goldStar = {
  color: "#C8A165",
  fontSize: "18px",
};
const userIcon = {
  width: "40px",
  height: "40px",
  backgroundColor: "#C8A165",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const inputSectionWrapper = { width: "100%", padding: "20px 0" };
const pillInputContainer = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#FFF",
  border: "1px solid #E5E7EB",
  borderRadius: "100px",
  padding: "8px 8px 8px 24px",
  minHeight: "56px",
  maxWidth: "800px",
  margin: "0 auto",
  boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
};
const pillField = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "16px",
  color: "#222",
};
const actionButtons = { display: "flex", alignItems: "center", gap: "8px" };

const circleBtn = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  background: "#FFF",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 3px rgba(0,0,0,0.04)",
};

const footerMeta = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "12px",
  padding: "0 10px",
  maxWidth: "800px",
  margin: "12px auto 0 auto",
};
const tipText = { fontSize: "13px", color: "#999" };
const linkHighlight = { color: "#183F34", fontWeight: "600" };
const createAccountText = { fontSize: "13px", color: "#183F34", fontWeight: "600", cursor: "pointer" };
const resetBtn = {
  background: "none",
  border: "1px solid #E5E7EB",
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#183F34",
  cursor: "pointer",
};
