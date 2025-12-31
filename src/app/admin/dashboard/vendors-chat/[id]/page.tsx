"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { User, Bot, Clock } from "lucide-react";

export default function VendorChatView() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", chatId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading)
    return <div className="p-20 text-center luxury-serif">Loading conversation...</div>;

  return (
    <div style={pageContainer}>
      <header style={header}>
        <h1 style={title}>Conversation Detail</h1>
        <p style={subtitle}>Viewing all messages between Aura and client</p>
      </header>

      <div ref={scrollRef} style={chatBox}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={msg.role === "aura" ? auraRow : userRow}
          >
            <div style={msg.role === "aura" ? auraAvatar : userAvatar}>
              {msg.role === "aura" ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div style={msg.role === "aura" ? auraBubble : userBubble}>
              {msg.text}
              <div style={timestamp}>
                <Clock size={10} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   LUXURY CHAT VIEWER STYLES
   ========================================================= */
const pageContainer = { maxWidth: "900px", margin: "0 auto", padding: "24px" };
const header = { marginBottom: "24px" };
const title = { fontFamily: "'Gilda Display', serif", fontSize: "32px", color: "#183F34", marginBottom: "4px" };
const subtitle = { fontSize: "14px", color: "#666" };
const chatBox = {
  background: "#FFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "24px",
  height: "75vh",
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
};

const auraRow = { display: "flex", alignItems: "flex-start", gap: "10px", alignSelf: "flex-start" };
const userRow = { display: "flex", alignItems: "flex-start", gap: "10px", alignSelf: "flex-end", flexDirection: "row-reverse" as const };

const auraBubble = { background: "#F3F4F6", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", color: "#183F34", fontSize: "15px", maxWidth: "70%", position: "relative" as const };
const userBubble = { background: "#183F34", padding: "12px 16px", borderRadius: "16px 16px 4px 16px", color: "#FFF", fontSize: "15px", maxWidth: "70%", position: "relative" as const };

const auraAvatar = { width: "36px", height: "36px", borderRadius: "50%", background: "#183F34", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" };
const userAvatar = { width: "36px", height: "36px", borderRadius: "50%", background: "#C8A165", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" };

const timestamp = { fontSize: "10px", color: "#999", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" };
