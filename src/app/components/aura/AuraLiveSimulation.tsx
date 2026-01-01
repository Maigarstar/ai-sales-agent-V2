"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Sparkles, Send, User, Mic, AudioLines, RefreshCw } from "lucide-react";

export default function AuraLiveSimulation() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "aura"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(envUrl && envKey);

  const supabase = useMemo(() => {
    if (!isConfigured) return null;
    return createBrowserClient(envUrl!, envKey!);
  }, [envUrl, envKey, isConfigured]);

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;

    const fetchAuraConfig = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

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
  }, [supabase]);

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
          text:
            "I’ve noted your request and am aligning it with our luxury standards.",
        },
      ]);
    }, 1200);
  };

  if (!mounted) return null;

  if (!isConfigured) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Supabase is not configured for this environment.
      </div>
    );
  }

  const sendButtonColor = input.length > 0 ? "#183F34" : "#C8CFC9";

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
            <div style={msg.role === "aura" ? auraBubble : userBubble}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={typingText}>Aura is thinking…</div>
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
            <button style={circleBtn}>
              <Mic size={18} color="#183F34" />
            </button>
            <button style={circleBtn}>
              <AudioLines size={18} color="#183F34" />
            </button>
            <button
              onClick={handleSendMessage}
              style={{
                ...circleBtn,
                backgroundColor: sendButtonColor,
                border: "none",
              }}
            >
              <Send size={16} color="#FFF" />
            </button>
          </div>
        </div>

        <div style={footerMeta}>
          <div style={tipText}>
            Tip, open anytime:{" "}
            <span style={linkHighlight}>5starweddingdirectory.com</span>
          </div>
          <div style={createAccountText}>Create account</div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "60px 20px",
  fontFamily: "'Nunito Sans', sans-serif",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "#F5F1EA",
  color: "#C5A059",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const title = {
  fontFamily: "'Gilda Display', serif",
  fontSize: 34,
  marginTop: 12,
};

const resetBtn = {
  background: "none",
  border: "1px solid #E5E7EB",
  padding: "8px 14px",
  borderRadius: 12,
  cursor: "pointer",
  display: "flex",
  gap: 6,
  alignItems: "center",
};

const chatBox = {
  border: "1px solid #EEE",
  borderRadius: 20,
  padding: 24,
  minHeight: 380,
  marginBottom: 30,
};

const auraRow = { display: "flex", gap: 14, marginBottom: 18 };
const userRow = { ...auraRow, justifyContent: "flex-end" };

const specialistIcon = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#C5A059",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFF",
};

const userIcon = {
  ...specialistIcon,
  background: "#183F34",
};

const goldStar = { fontSize: 16 };

const auraBubble = {
  background: "#F9F7F3",
  padding: "12px 16px",
  borderRadius: 16,
  maxWidth: 520,
};

const userBubble = {
  ...auraBubble,
  background: "#183F34",
  color: "#FFF",
};

const typingText = {
  marginLeft: 48,
  color: "#C8A165",
  fontSize: 13,
};

const inputSectionWrapper = { marginTop: 20 };

const pillInputContainer = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  padding: "8px 12px",
};

const pillField = {
  flex: 1,
  border: "none",
  outline: "none",
  padding: "10px 14px",
  fontSize: 14,
};

const actionButtons = { display: "flex", gap: 6 };

const circleBtn = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #E5E7EB",
  background: "#FFF",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const footerMeta = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 12,
  fontSize: 12,
  color: "#777",
};

const tipText = {};
const linkHighlight = { color: "#C5A059", fontWeight: 700 };
const createAccountText = { cursor: "pointer" };
