"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, Menu, X, Sun, Moon, ShieldCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


type Message = {
  role: "user" | "assistant";
  content: string;
  kind?: "text" | "auth_gate";
};

const BRAND_GOLD = "#C5A059";

// Defaults you already use elsewhere
const DEFAULT_ORG_ID = "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
const DEFAULT_AGENT_ID = "70660422-489c-4b7d-81ae-b786e43050db";

// Guest cap before asking to create account
const GUEST_MESSAGE_LIMIT = 3;

export default function AuraRefinedChat() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Good evening. I am Aura, your wedding concierge. Tell me a little about your plans, and I will guide you.",
      kind: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Default to luxury black
  const [isLightMode, setIsLightMode] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme load and persist
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("aura_theme") : null;
    if (saved === "light") setIsLightMode(true);
    if (saved === "dark") setIsLightMode(false);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aura_theme", isLightMode ? "light" : "dark");
    }
  }, [isLightMode]);

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load Supabase session and subscribe to changes
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  async function sendViaVendorsAPI(next: Message[]) {
    const res = await fetch("/api/vendors-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organisationId: DEFAULT_ORG_ID,
        agentId: DEFAULT_AGENT_ID,
        chatType: "couple",
        messages: next.map(({ role, content }) => ({ role, content })),
        conversationId,
      }),
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Vendors chat failed");
    if (data.conversationId) setConversationId(data.conversationId);
    return String(data.reply ?? "");
  }

  async function sendViaGenericAPI(next: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
    });
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Chat failed");
    return String(data.reply ?? "");
  }

  function pushAuthGateBubble() {
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        kind: "auth_gate",
        content: "Create your free account to continue and save your shortlist.",
      },
    ]);
  }

  const handleSend = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content || busy) return;

    // Guest cap
    if (!session) {
      const guestMsgs = messages.filter((m) => m.role === "user").length;
      if (guestMsgs >= GUEST_MESSAGE_LIMIT) {
        const alreadyShown = messages.some((m) => m.kind === "auth_gate");
        if (!alreadyShown) pushAuthGateBubble();
        return;
      }
    }

    const userMsg: Message = { role: "user", content, kind: "text" };
    const next = [...messages, userMsg];

    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      let reply = "";
      try {
        reply = await sendViaVendorsAPI(next);
      } catch {
        reply = await sendViaGenericAPI(next);
      }
      setMessages((m) => [...m, { role: "assistant", content: reply, kind: "text" }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I could not reach the concierge service. Please try again.",
          kind: "text",
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const resetThread = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "New conversation started. Tell me your date, guest count, and preferred locations, and I will shortlist the right venues and vendors.",
        kind: "text",
      },
    ]);
    setConversationId(null);
    setInput("");
    setIsSidebarOpen(false);
  };

  function goAuth(path: "/public/login" | "/public/signup") {
    const returnTo = encodeURIComponent("/wedding-concierge/chat");
    // Keep it simple, no hyphens or em dashes in output text
    window.location.href = `${path}?returnTo=${returnTo}`;
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col antialiased transition-colors duration-500 ${
        isLightMode ? "bg-white" : "bg-[#0E100F]"
      }`}
    >
      {/* Overlay for sidebar */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isSidebarOpen ? "bg-black/40" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-full w-[280px] p-6 transition-transform duration-300 border-r ${
          isLightMode ? "bg-white border-black/10" : "bg-[#121413] border-white/10"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <p
            className={`text-[10px] tracking-[0.2em] uppercase ${
              isLightMode ? "text-neutral-600" : "text-white/60"
            }`}
          >
            Wedding Concierge
          </p>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={isLightMode ? "text-neutral-600" : "text-white"}
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetThread}
            className={`w-full flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs transition ${
              isLightMode ? "bg-[#183F34] text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Plus size={16} />
            New Conversation
          </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`relative z-50 flex items-center justify-between border-b px-4 py-3 ${
          isLightMode ? "bg-white border-black/10" : "bg-[#0E100F] border-white/10"
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={isLightMode ? "text-neutral-700" : "text-white"}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <h1
              className={`luxury-serif uppercase tracking-tight leading-none ${
                isLightMode ? "text-[#112620]" : "text-white"
              }`}
              style={{ fontSize: 36 }}
            >
              5 Star Weddings
            </h1>
            {!session && (
              <span className="ml-1 text-[10px] px-2 py-1 rounded-full border border-neutral-300">
                Guest
              </span>
            )}
          </div>
          <h2
            className="luxury-serif uppercase leading-none mt-1"
            style={{ fontSize: 22, color: BRAND_GOLD }}
          >
            Concierge
          </h2>
        </div>

        <button
          onClick={() => setIsLightMode((v) => !v)}
          className={`p-2 rounded-full ${isLightMode ? "text-neutral-700" : "text-white"}`}
          aria-label="Toggle light mode"
        >
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Chat Feed */}
      <main className="flex-1 overflow-y-auto px-4 pt-8 pb-44" ref={scrollRef}>
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {messages.map((m, i) => {
            if (m.kind === "auth_gate") {
              return (
                <div key={i} className="flex justify-start">
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-5 text-[15px] leading-relaxed ${
                      isLightMode ? "bg-[#F2F4F3] text-[#112620]" : "bg-white/10 text-white"
                    }`}
                  >
                    <div className="mb-3">{m.content}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => goAuth("/public/login")}
                        className="px-3 py-2 text-sm rounded-full border border-neutral-300 bg-white text-[#112620] hover:bg-neutral-50"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => goAuth("/public/signup")}
                        className="px-3 py-2 text-sm rounded-full bg-[#183F34] text-white hover:opacity-90"
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const isUser = m.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed ${
                    isUser
                      ? "bg-[#183F34] text-white"
                      : isLightMode
                        ? "bg-[#F2F4F3] text-[#112620]"
                        : "bg-white/10 text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {busy && (
            <div className={`text-sm ${isLightMode ? "text-neutral-500" : "text-white/70"}`}>
              Aura is thinking…
            </div>
          )}
        </div>
      </main>

      {/* Input and footer */}
      <footer
        className={`shrink-0 px-4 py-6 border-t ${
          isLightMode ? "bg-white border-black/10" : "bg-[#0E100F] border-white/10"
        }`}
      >
        <div className="mx-auto w-full max-w-3xl">
          {/* Input pill */}
          <div
            className={`relative flex items-center gap-3 rounded-full border px-4 shadow-sm ${
              isLightMode ? "bg-white border-neutral-300" : "bg-[#121413] border-white/10"
            }`}
          >
            <button
              type="button"
              className={`p-2 rounded-full ${isLightMode ? "text-neutral-600" : "text-white/80"} hover:opacity-80`}
              title="Voice coming soon"
            >
              <Mic size={18} />
            </button>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Aura…"
              className={`flex-1 bg-transparent py-4 text-[15px] outline-none ${
                isLightMode ? "text-[#112620] placeholder:text-neutral-400" : "text-white placeholder:text-white/40"
              }`}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || busy}
              className={`ml-1 h-10 w-10 rounded-full flex items-center justify-center transition ${
                input.trim() && !busy
                  ? "bg-[#183F34] text-white hover:opacity-90"
                  : isLightMode
                    ? "bg-neutral-200 text-neutral-400"
                    : "bg-white/10 text-white/30"
              }`}
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Footer brand row */}
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <div className="opacity-60">
              <a href="/cookie-preferences" className="underline">
                Cookie Preferences
              </a>
            </div>
            <div className="flex items-center gap-2 opacity-70">
              <ShieldCheck size={12} />
              <span>Powered by Taigenic.ai</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
