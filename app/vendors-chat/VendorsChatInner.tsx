"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import AuraVoice from "@/components/AuraVoice";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VendorsChatInner() {
  const searchParams = useSearchParams();

  // 1. Capture URL Params (Embed logic)
  const isEmbed = searchParams.get("embed") === "1";
  const initialChatType =
    searchParams.get("chatType") === "couple" ? "couple" : "vendor";
  const organisationId =
    searchParams.get("organisationId") ||
    "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
  const agentId =
    searchParams.get("agentId") || "70660422-489c-4b7d-81ae-b786e43050db";

  // 2. UI State
  const [view, setView] = useState<"form" | "chat">("form");
  const [mode, setMode] = useState<"vendor" | "couple">(initialChatType);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 3. Chat Data
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 4. Form Data
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

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, view]);

  // ACTION: Submit Form & Start Chat
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsStarting(true);

    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: isVendor ? "vendor" : "couple",
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
              ? "Hello. I am your wedding concierge. How can I help with your venue or business?"
              : "Hello. I am your wedding concierge. How can I help you plan your day?",
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

  // ACTION: Send Message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          chatType: mode,
          conversationId,
          organisationId,
          agentId,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
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

  // ACTION: Delete/Clear
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
    setFormData({
      name: "",
      email: "",
      phone: "",
      venueOrLocation: "",
      website: "",
      weddingDate: "",
    });
  };

  // RENDER: FORM VIEW
  if (view === "form") {
    return (
      <div
        className={`flex flex-col justify-center font-sans bg-gray-50 ${
          isEmbed
            ? "min-h-screen py-0"
            : "min-h-screen py-12 sm:px-6 lg:px-8"
        }`}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
          <h1 className="text-3xl font-serif text-[#1F4D3E] mb-2">
            Wedding Concierge
          </h1>
          <p className="text-gray-600 mb-6">
            Please tell us a bit about yourself to start.
          </p>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-1 rounded-full border border-gray-200 inline-flex">
              <button
                onClick={() => setMode("vendor")}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === "vendor"
                    ? "bg-[#1F4D3E] text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                I am a Vendor
              </button>
              <button
                onClick={() => setMode("couple")}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === "couple"
                    ? "bg-[#1F4D3E] text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                I am a Couple
              </button>
            </div>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className={`bg-white shadow sm:rounded-lg border border-gray-100 ${
              isEmbed ? "p-6 h-full shadow-none border-0" : "py-8 px-6 sm:px-10"
            }`}
          >
            <form className="space-y-5" onSubmit={handleStartChat}>
              {formError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                  />
                </div>

                {isVendor ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="For example yoursite.com"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, weddingDate: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isVendor ? "Company or Venue Name" : "Venue Location or Preferences"}
                </label>
                <input
                  type="text"
                  value={formData.venueOrLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      venueOrLocation: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                />
              </div>

              <button
                type="submit"
                disabled={isStarting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#163C30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] disabled:opacity-50"
              >
                {isStarting ? "Starting..." : "Start Chatting"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: CHAT VIEW
  return (
    <div
      className={`flex flex-col bg-white sm:bg-gray-50 text-gray-900 font-sans ${
        isEmbed ? "h-screen" : "h-[calc(100vh-64px)]"
      }`}
    >
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center border-b border-gray-100">
        <div>
          <h1 className="text-xl font-serif text-[#1F4D3E]">Concierge Chat</h1>
          <p className="text-xs text-gray-500">Chatting as {formData.name}</p>
        </div>
        <button
          onClick={handleDeleteConversation}
          className="text-gray-400 hover:text-red-500 transition-colors p-2"
          title="End Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-hidden relative w-full max-w-3xl mx-auto sm:px-4 sm:pb-4">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth pb-24 sm:pb-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex w-full ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-[15px] sm:text-base leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-[#1F4D3E] text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="bg-white border-t border-gray-100 p-3 sm:p-4 w-full z-20">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white sm:bg-transparent">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-white sm:bg-gray-50 border border-gray-300 rounded-2xl pl-4 pr-28 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1F4D3E] focus:border-transparent resize-none shadow-sm"
              rows={1}
              style={{ minHeight: "50px", maxHeight: "120px" }}
            />

            {/* Voice + Send controls inside the composer */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <AuraVoice />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2 bg-[#1F4D3E] text-white rounded-xl hover:bg-[#163C30] disabled:opacity-50 transition-colors shadow-sm"
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
