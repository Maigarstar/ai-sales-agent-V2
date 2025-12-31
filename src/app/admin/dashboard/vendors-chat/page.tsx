"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Mic,
  Send,
  Sparkles,
  AudioLines,
  User,
  RefreshCw,
  Paperclip,
  MessageCircle,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function VendorsChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "aura"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<{ name: string; path: string }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setMessages([
          {
            role: "aura",
            text: `Good afternoon. I am Aura, your bespoke specialist for ${data?.company_name || "5 Star Weddings"}. How may I assist you today?`,
          },
        ]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sanitizeAuraResponse = (rawText: string) => {
    let cleaned = rawText;
    const systemIntros = [
      /Planning a big, luxurious wedding is all about.*/gi,
      /As your luxury wedding concierge, I'm here to ensure.*/gi,
      /It is my goal to bring your dream wedding to life.*/gi,
    ];
    systemIntros.forEach((regex) => {
      cleaned = cleaned.replace(regex, "");
    });
    cleaned = cleaned.replace(/<metadata>[\s\S]*?<\/metadata>/gi, "");
    cleaned = cleaned.replace(/```json[\s\S]*?```/gi, "");
    cleaned = cleaned.replace(/```[\s\S]*?```/gi, "");
    return cleaned.trim();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user?.id}/knowledge/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("knowledge-base").upload(filePath, file);
    if (!error) {
      setKnowledgeBase((prev) => [...prev, { name: file.name, path: filePath }]);
      setMessages((prev) => [...prev, { role: "aura", text: `I have successfully indexed "${file.name}".` }]);
    }
    setUploading(false);
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    const history = messages.map((m) => ({
      role: m.role === "aura" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const response = await fetch("/api/aura/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          messages: history,
          knowledgeContext: knowledgeBase,
          conversation_id: conversationId,
          mode: "vendor",
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const cleanReply = sanitizeAuraResponse(data.reply);
        setMessages((prev) => [
          ...prev,
          { role: "aura", text: cleanReply || data.reply },
        ]);
        if (data.conversation_id) setConversationId(data.conversation_id);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "aura", text: "I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!mounted) return null;

  const isInputActive = input.length > 0 || isRecording;
  const sendButtonColor = isInputActive ? "#2D4138" : "#9BA89B";

  return (
    <div style={container}>
      <header style={header}>
        <div>
          <div style={badge}>
            <Sparkles size={12} /> Aura Intelligence
          </div>
          <h1 className="luxury-serif" style={title}>
            Your Concierge
          </h1>
        </div>
        <button onClick={() => window.location.reload()} style={resetBtn}>
          <RefreshCw size={14} /> Reset Session
        </button>
      </header>

      <div style={chatBox} ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "aura" ? auraRow : userRow}>
            <div style={msg.role === "aura" ? auraAvatar : userAvatar}>
              {msg.role === "aura" ? <span style={brandFive}>5</span> : <User size={16} />}
            </div>
            <div style={msg.role === "aura" ? auraBubble : userBubble}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={typing}>Aura is preparing your bespoke response...</div>
        )}
      </div>

      <div style={inputSectionWrapper}>
        <div style={pillInputContainer}>
          <label style={leftUploadBtn}>
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
            />
            {uploading ? (
              <Loader2 size={20} className="animate-spin" color="#C5A059" />
            ) : (
              <Paperclip size={20} color="#4B5563" />
            )}
          </label>

          <input
            style={inputField}
            placeholder={isRecording ? "Listening..." : "Message Aura about your wedding..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <div style={actionButtons}>
            <button onClick={startVoiceCapture} style={iconOnlyBtn}>
              <Mic size={22} color={isRecording ? "#2D4138" : "#4B5563"} />
            </button>
            <button style={iconOnlyBtn}>
              <AudioLines size={22} color="#888888" />
            </button>
            <button style={iconOnlyBtn}>
              <MessageCircle size={22} color="#4B5563" />
            </button>
            <button
              onClick={handleSend}
              style={{ ...sendCircleBtn, backgroundColor: sendButtonColor }}
            >
              <Send size={18} color="#FFF" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === Existing Styling (No changes) === */
const container = { height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" as const };
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" };
const badge = { display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: "700", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" as const };
const title = { fontSize: "32px", color: "var(--text-primary)", marginTop: "8px" };
const chatBox = { flex: 1, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: "20px" };
const auraRow = { display: "flex", gap: "12px", alignSelf: "flex-start", maxWidth: "80%" };
const userRow = { display: "flex", gap: "12px", alignSelf: "flex-end", flexDirection: "row-reverse" as const, maxWidth: "80%" };
const auraAvatar = { width: "36px", height: "36px", backgroundColor: "#2D312F", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #C5A059" };
const userAvatar = { width: "36px", height: "36px", backgroundColor: "#C5A059", color: "#FFF", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const brandFive = { color: "#C5A059", fontWeight: "700", fontSize: "18px" };
const auraBubble = { backgroundColor: "#F3F4F6", color: "#2D312F", padding: "14px 20px", borderRadius: "20px 20px 20px 4px", fontSize: "15px", lineHeight: "1.6" };
const userBubble = { backgroundColor: "#2D4138", color: "#FFF", padding: "14px 20px", borderRadius: "20px 20px 4px 20px", fontSize: "15px", lineHeight: "1.6" };
const typing = { fontSize: "11px", color: "#C5A059", fontStyle: "italic", marginLeft: "48px" };
const inputSectionWrapper = { width: "100%", padding: "20px 0" };
const pillInputContainer = { display: "flex", alignItems: "center", backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "9999px", padding: "6px 6px 6px 16px", minHeight: "56px", maxWidth: "800px", margin: "0 auto", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" };
const inputField = { flex: 1, border: "none", outline: "none", fontSize: "16px", color: "#000", paddingLeft: "12px" };
const actionButtons = { display: "flex", alignItems: "center", gap: "16px", paddingRight: "4px" };
const leftUploadBtn = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" };
const iconOnlyBtn = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" };
const sendCircleBtn = { width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" };
const resetBtn = { background: "none", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" };
