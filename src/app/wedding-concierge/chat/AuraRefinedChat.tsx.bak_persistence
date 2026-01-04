"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, Menu, X, Sun, Moon, ShieldCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  kind?: "text" | "auth_gate";
};

const BRAND_GOLD = "#C5A059";

const DEFAULT_ORG_ID = "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
const DEFAULT_AGENT_ID = "70660422-489c-4b7d-81ae-b786e43050db";

const GUEST_MESSAGE_LIMIT = 3;

export default function AuraRefinedChat() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

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
  const [isLightMode, setIsLightMode] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aura_theme");
    if (saved === "light") setIsLightMode(true);
    if (saved === "dark") setIsLightMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("aura_theme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession(data.session ?? null)
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s ?? null)
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

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
    if (!data?.ok) throw new Error();
    if (data.conversationId) setConversationId(data.conversationId);
    return String(data.reply ?? "");
  }

  async function sendViaGenericAPI(next: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: next.map(({ role, content }) => ({ role, content })),
      }),
    });

    const data = await res.json();
    if (!data?.ok) throw new Error();
    return String(data.reply ?? "");
  }

  function pushAuthGateBubble() {
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        kind: "auth_gate",
        content:
          "Create your free account to continue and save your shortlist.",
      },
    ]);
  }

  const handleSend = async () => {
    const content = input.trim();
    if (!content || busy) return;

    if (!session) {
      const guestCount = messages.filter((m) => m.role === "user").length;
      if (guestCount >= GUEST_MESSAGE_LIMIT) {
        if (!messages.some((m) => m.kind === "auth_gate")) {
          pushAuthGateBubble();
        }
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

      setMessages((m) => [
        ...m,
        { role: "assistant", content: reply, kind: "text" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I could not reach the concierge service. Please try again.",
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
    window.location.href = `${path}?returnTo=${returnTo}`;
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-colors duration-500 ${
        isLightMode ? "bg-white" : "bg-[#0E100F]"
      }`}
    >
      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-[60] ${
          isSidebarOpen ? "bg-black/40" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-full w-[280px] p-6 border-r transition-transform ${
          isLightMode
            ? "bg-white border-black/10"
            : "bg-[#121413] border-white/10"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-70">
            Wedding Concierge
          </p>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <button
          onClick={resetThread}
          className={`w-full flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs ${
            isLightMode
              ? "bg-[#183F34] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Plus size={16} />
          New Conversation
        </button>
      </aside>

      {/* Header */}
      <header
        className={`z-50 flex items-center justify-between border-b px-4 py-3 ${
          isLightMode
            ? "bg-white border-black/10"
            : "bg-[#0E100F] border-white/10"
        }`}
      >
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>

        <div className="text-center">
          <h1
            className={`luxury-serif uppercase ${
              isLightMode ? "text-[#112620]" : "text-white"
            }`}
            style={{ fontSize: 36 }}
          >
            5 Star Weddings
          </h1>
          <h2
            className="luxury-serif uppercase mt-1"
            style={{ fontSize: 22, color: BRAND_GOLD }}
          >
            Concierge
          </h2>
        </div>

        <button onClick={() => setIsLightMode((v) => !v)}>
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Chat */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-8 pb-44">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((m, i) => {
            if (m.kind === "auth_gate") {
              return (
                <div key={i} className="flex justify-start">
                  <div className="rounded-2xl px-5 py-5 bg-white/10 text-white">
                    <div className="mb-3">{m.content}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goAuth("/public/login")}
                        className="px-3 py-2 rounded-full border bg-white text-[#112620]"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => goAuth("/public/signup")}
                        className="px-3 py-2 rounded-full bg-[#183F34] text-white"
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
              <div
                key={i}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-5 py-4 ${
                    isUser
                      ? "bg-[#183F34] text-white"
                      : isLightMode
                      ? "bg-[#F2F4F3] text-[#112620]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}

          {busy && <div className="opacity-60">Aura is thinking…</div>}
        </div>
      </main>

      {/* Input */}
      <footer
        className={`px-4 py-6 border-t ${
          isLightMode
            ? "bg-white border-black/10"
            : "bg-[#0E100F] border-white/10"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-full border px-4">
            <Mic size={18} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Aura…"
              className="flex-1 bg-transparent py-4 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || busy}
              className="h-10 w-10 rounded-full bg-[#183F34] text-white flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] opacity-70">
            <a href="/cookie-preferences" className="underline">
              Cookie Preferences
            </a>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} />
              Powered by Taigenic.ai
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
