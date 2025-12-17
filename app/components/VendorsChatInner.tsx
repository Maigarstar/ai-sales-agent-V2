"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import AuraVoice from "@/components/AuraVoice";
import VoiceToTextButton from "@/components/VoiceToTextButton";

/* =========================================================
   Footer Component (Cleaned)
   ========================================================= */
function BrandFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="w-full text-center text-[11px] sm:text-[12px] text-gray-400 py-6 mt-auto">
      Powered by <span className="text-gray-500 font-medium">Taigenic.ai</span>
      {" - "}
      5 Star Weddings Ltd. 2006-{year}
    </div>
  );
}

/* =========================================================
   Main Chat Component
   ========================================================= */
type Message = { role: "user" | "assistant"; content: string };

export default function VendorsChatInner() {
  const searchParams = useSearchParams();

  // URL Params
  const isEmbed = searchParams.get("embed") === "1";
  const initialChatType = searchParams.get("chatType") === "couple" ? "couple" : "vendor";
  const organisationId = searchParams.get("organisationId") || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
  const agentId = searchParams.get("agentId") || "70660422-489c-4b7d-81ae-b786e43050db";

  // State
  const [view, setView] = useState<"form" | "chat">("form");
  const [mode, setMode] = useState<"vendor" | "couple">(initialChatType);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    venueOrLocation: "",
    website: "",
    weddingDate: "",
  });
  const [formError, setFormError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const isVendor = mode === "vendor";

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, view]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 180);
    el.style.height = `${next}px`;
  }, [input]);

  // Start Chat
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsStarting(true);

    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: isVendor ? "vendor" : "planning",
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.phone,
          venue_or_location: formData.venueOrLocation,
          website: isVendor ? formData.website : null,
          wedding_date: !isVendor ? formData.weddingDate : null,
          organisationId,
          agentId,
        }),
      });

      const data = await res.json();

      if (data.ok && data.conversationId) {
        setConversationId(data.conversationId);
        setView("chat");
        setMessages([
          {
            role: "assistant",
            content: isVendor
              ? "Hello, I am Aura. I can help you attract more destination couples with sharper positioning, elevated content, SEO visibility, and premium placement in our Luxury Wedding Collection. To start, where are you based (country and region), and what type of business are you (venue, planner, photographer, band, styling)?"
              : "Hello, I am Aura. I can help you shape the perfect wedding plan, recommend venues and trusted vendors, and build a clear shortlist. To begin, what destination are you considering, and roughly how many guests?",
          },
        ]);
      } else {
        setFormError(data.error || "Could not start chat.");
      }
    } catch (err) {
      console.error("Start chat error:", err);
      setFormError("Network error. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  // Send Message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMsg: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          chatType: mode,
          conversationId,
          organisationId,
          agentId,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // End Chat
  const handleDeleteConversation = async () => {
    if (!confirm("Are you sure you want to end this chat?")) return;
    if (conversationId) {
      await fetch("/api/vendor/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      }).catch(console.error);
    }
    setView("form");
    setMessages([]);
    setConversationId(null);
    setInput("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      venueOrLocation: "",
      website: "",
      weddingDate: "",
    });
  };

  /* =========================
     RENDER: FORM VIEW
     ========================= */
  if (view === "form") {
    return (
      <div className={`min-h-screen flex flex-col bg-gray-50 ${isEmbed ? "py-0" : "py-12 sm:px-6 lg:px-8"}`}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
            <div className="text-center mb-2">
              <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 44, fontWeight: 400, lineHeight: 1.1 }}>
                5 Star Weddings
              </h1>
              <h2 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 30, fontWeight: 400, marginTop: "4px" }}>
                Concierge
              </h2>
            </div>

            <p className="text-gray-600 mb-6">Please tell us a bit about yourself to start.</p>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-1 rounded-full border border-gray-200 inline-flex">
                <button
                  onClick={() => setMode("vendor")}
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === "vendor" ? "bg-[#1F4D3E] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  I am a Vendor
                </button>
                <button
                  onClick={() => setMode("couple")}
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === "couple" ? "bg-[#1F4D3E] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  I am a Couple
                </button>
              </div>
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className={`bg-white shadow sm:rounded-lg border border-gray-100 ${isEmbed ? "p-6 h-full shadow-none border-0" : "py-8 px-6 sm:px-10"}`}>
              <form className="space-y-5" onSubmit={handleStartChat}>
                {formError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{formError}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                  </div>

                  {isVendor ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="For example yoursite.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wedding Date</label>
                      <input type="date" value={formData.weddingDate} onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {isVendor ? "Company or Venue Name" : "Venue Location or Preferences"}
                  </label>
                  <input type="text" value={formData.venueOrLocation} onChange={(e) => setFormData({ ...formData, venueOrLocation: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <button type="submit" disabled={isStarting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#163C30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] disabled:opacity-50">
                  {isStarting ? "Starting..." : "Start Chatting"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <BrandFooter />
      </div>
    );
  }

  /* =========================
     RENDER: CHAT VIEW
     ========================= */
  return (
    <div className={`min-h-screen flex flex-col bg-white sm:bg-gray-50 text-gray-900 font-sans ${isEmbed ? "h-screen" : "h-[calc(100vh-64px)]"}`}>
      {/* Header */}
      <div className="bg-white p-6 shadow-sm z-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto relative flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 34, fontWeight: 400, lineHeight: 1.1 }}>
              5 Star Weddings
            </h1>
            <h2 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 24, fontWeight: 400, lineHeight: 1.1 }}>
              Concierge
            </h2>
            <p className="text-gray-500 mt-2" style={{ fontFamily: "var(--font-nunito sans), serif", fontSize: 16 }}>
              Chatting with Aura, Your AI Wedding Specialist
            </p>
          </div>

          <button
            onClick={handleDeleteConversation}
            className="absolute right-0 text-gray-400 hover:text-red-500 transition-colors p-2"
            title="End Chat"
            aria-label="End Chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative w-full max-w-3xl mx-auto sm:px-4 sm:pb-4">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth pb-24 sm:pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-[15px] sm:text-base leading-relaxed shadow-sm ${
                  m.role === "user" ? "bg-[#1F4D3E] text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4 w-full z-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white border border-gray-200 rounded-[26px] shadow-sm px-5 py-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isVendor ? "Message Aura about your venue or business" : "Message Aura about your wedding"}
              className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed pr-44"
              rows={1}
              style={{ minHeight: "46px", maxHeight: "180px" }}
            />
            <div className="absolute right-4 bottom-3 flex items-center gap-3">
              <VoiceToTextButton onText={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))} />
              <AuraVoice />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="h-11 w-11 rounded-full flex items-center justify-center bg-black text-white shadow-sm disabled:opacity-40"
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BrandFooter />
    </div>
  );
}