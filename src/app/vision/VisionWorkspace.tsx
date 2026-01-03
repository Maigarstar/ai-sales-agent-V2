// src/app/vision/VisionWorkspace.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Sun,
  Moon,
  ArrowUp,
  Sparkles,
  Plus,
  User,
  Mic,
  X,
  Radio,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Share2,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  UserPlus,
} from "lucide-react";

type ChatRole = "user" | "assistant";
type ChatType = "business" | "couple";

type Message = {
  id: string;
  role: ChatRole;
  content: string;
  feedback?: "up" | "down" | null;
};

type Thread = {
  id: string;
  title: string;
  chatType: ChatType;
  messages: Message[];
  updatedAt: number;
};

const STORAGE_KEY = "taigenic_vision_threads_v1";
const MAX_RECENTS = 4;

const BRAND_GOLD = "#c6a157";

function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function VisionWorkspace() {
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);

  // UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectionOpen, setIsProjectionOpen] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Auth gate
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showRegisterChooser, setShowRegisterChooser] = useState(false);

  // Chat
  const [chatType, setChatType] = useState<ChatType>("couple");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isAuthed = useMemo(() => {
    if (!mounted) return false;
    try {
      return localStorage.getItem("taigenic_authed") === "true";
    } catch {
      return false;
    }
  }, [mounted]);

  const theme = useMemo(() => {
    return isLightMode
      ? {
          bg: "bg-white",
          page: "bg-white",
          text: "text-[#111111]",
          border: "border-black/10",
          bubble: "bg-white",
          bubbleBorder: "border-black/10",
          sidebar: "bg-[#f6f6f6]",
          surface: "bg-white",
          subtle: "text-black/55",
        }
      : {
          bg: "bg-[#070707]",
          page: "bg-[#070707]",
          text: "text-white",
          border: "border-white/10",
          bubble: "bg-[#141414]",
          bubbleBorder: "border-white/10",
          sidebar: "bg-[#101010]",
          surface: "bg-[#0F0F0F]",
          subtle: "text-white/45",
        };
  }, [isLightMode]);

  const iconColor = useMemo(() => {
    return isLightMode ? "#3f3f3f" : BRAND_GOLD;
  }, [isLightMode]);

  const actionIconColor = useMemo(() => {
    return isLightMode ? "#5a5a5a" : "rgba(255,255,255,0.70)";
  }, [isLightMode]);

  const currentThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  const messages = currentThread?.messages || [];

  const userTurns = useMemo(() => {
    return messages.filter((m) => m.role === "user").length;
  }, [messages]);

  const showRegisterNudge = useMemo(() => {
    return !isAuthed && userTurns >= 2;
  }, [isAuthed, userTurns]);

  // 4 curated images each
  const auraPlaceholders = useMemo(
    () => [
      "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523438097201-512ae7c5c0f6?auto=format&fit=crop&w=1200&q=80",
    ],
    []
  );

  const atlasPlaceholders = useMemo(
    () => [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    ],
    []
  );

  const introText = useMemo(() => {
    if (chatType === "business") {
      return "Welcome. Atlas online. Share your venue or service, I will guide how we connect you to destination couples within 5 Star Weddings, shape your positioning, and outline next steps to work with us. If you prefer, I can pass your details to the right person.";
    }
    return "Welcome. Aura online. Share what you are creating, I will curate venues and recommended vendors within 5 Star Weddings, then guide you from first idea to final detail. If you prefer, I can pass your details to the right person.";
  }, [chatType]);

  // Load and init
  useEffect(() => {
    setMounted(true);

    const initialType: ChatType =
      searchParams.get("chatType") === "business" ? "business" : "couple";
    setChatType(initialType);

    // Load threads
    let loaded: Thread[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = [];
    }

    // Keep only MAX_RECENTS in storage as well
    loaded = loaded
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_RECENTS);

    if (!loaded.length) {
      const t: Thread = {
        id: uid("t"),
        title: initialType === "business" ? "For Vendors" : "For Couples",
        chatType: initialType,
        messages: [],
        updatedAt: Date.now(),
      };
      loaded = [t];
    }

    setThreads(loaded);
    setActiveThreadId(loaded[0].id);

    // Mobile default
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    if (w < 1024) setIsSidebarOpen(false);

    // Speech recognition setup
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-GB";

        recognition.onstart = () => {
          setVoiceError(null);
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const err = String(event?.error || "");
          if (err.includes("not-allowed") || err.includes("service-not-allowed")) {
            setVoiceError(
              "Microphone permission is blocked. Please allow microphone access in your browser settings, then try again."
            );
            return;
          }
          setVoiceError("Voice is unavailable on this device or browser.");
        };

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
          }
          if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognitionRef.current = recognition;
      }
    }
  }, [searchParams]);

  // Persist threads
  useEffect(() => {
    if (!mounted) return;
    try {
      const compact = threads
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    } catch {}
  }, [threads, mounted]);

  // Scroll
  useEffect(() => {
    if (!mounted) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mounted, messages, loading]);

  // Auto resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = clamp(el.scrollHeight, 44, 140);
    el.style.height = `${next}px`;
  }, [input]);

  // Typewriter intro once thread is active and empty
  useEffect(() => {
    if (!mounted) return;
    if (!currentThread) return;
    if (currentThread.messages.length) return;

    const introId = uid("intro");
    const base: Message = { id: introId, role: "assistant", content: "" };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThread.id
          ? { ...t, messages: [base], updatedAt: Date.now() }
          : t
      )
    );

    let i = 0;
    const full = introText;
    const tick = setInterval(() => {
      i += 2;
      const partial = full.slice(0, i);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === currentThread.id
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === introId ? { ...m, content: partial } : m
                ),
                updatedAt: Date.now(),
              }
            : t
        )
      );
      if (i >= full.length) clearInterval(tick);
    }, 18);

    return () => clearInterval(tick);
  }, [mounted, currentThread?.id, introText]);

  if (!mounted) return <div className="h-screen w-full bg-[#070707]" />;

  const setThreadMessages = (threadId: string, nextMessages: Message[]) => {
    setThreads((prev) =>
      prev
        .map((t) =>
          t.id === threadId ? { ...t, messages: nextMessages, updatedAt: Date.now() } : t
        )
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENTS)
    );
  };

  const handleToggle = (type: ChatType) => {
    setChatType(type);

    const t: Thread = {
      id: uid("t"),
      title: type === "business" ? "For Vendors" : "For Couples",
      chatType: type,
      messages: [],
      updatedAt: Date.now(),
    };

    setThreads((prev) => [t, ...prev].slice(0, MAX_RECENTS));
    setActiveThreadId(t.id);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const startVoiceVision = () => {
    setVoiceError(null);
    if (!recognitionRef.current) {
      setVoiceError("Voice is unavailable on this device or browser.");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch {}
  };

  const stopVoiceVision = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const openAuthGate = () => {
    setShowAuthGate(true);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!currentThread) return;

    // Gate on the 4th user prompt
    if (!isAuthed && userTurns >= 3) {
      openAuthGate();
      return;
    }

    if (isListening) stopVoiceVision();

    const userMsg: Message = { id: uid("u"), role: "user", content: input.trim() };
    const next = [...messages, userMsg];

    setInput("");
    setThreadMessages(currentThread.id, next);
    setLoading(true);

    // Optional: if user just hit the 3rd prompt, show a gentle nudge in UI only
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatType,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          userTurns: userTurns + 1,
        }),
      });

      const json = await res.json();
      const replyText = String(json?.reply || "Connection interrupted.").trim();

      const assistantMsg: Message = { id: uid("a"), role: "assistant", content: replyText };
      setThreadMessages(currentThread.id, [...next, assistantMsg]);
    } catch {
      const assistantMsg: Message = {
        id: uid("a"),
        role: "assistant",
        content: "Connection interrupted.",
      };
      setThreadMessages(currentThread.id, [...next, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const onShare = async (text: string) => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const setFeedback = (messageId: string, value: "up" | "down") => {
    if (!currentThread) return;
    const next = messages.map((m) =>
      m.id === messageId ? { ...m, feedback: m.feedback === value ? null : value } : m
    );
    setThreadMessages(currentThread.id, next);
  };

  const mobileSidebar = typeof window !== "undefined" ? window.innerWidth < 1024 : false;

  return (
    <div
      className={`h-screen w-full flex ${theme.bg} ${theme.text} overflow-hidden relative`}
      style={{ fontFamily: "var(--font-nunito)" }}
    >
      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && mobileSidebar && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[90] bg-black"
          />
        )}
      </AnimatePresence>

      {/* VOICE OVERLAY */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
          >
            <div
              className="w-full max-w-md border p-10 rounded-[28px] text-center shadow-2xl relative"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <button
                onClick={() => setShowVoiceOverlay(false)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
              >
                <X size={18} style={{ color: iconColor }} />
              </button>

              <div
                className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-6"
                style={{
                  borderColor: isLightMode ? "rgba(0,0,0,0.25)" : `${BRAND_GOLD}66`,
                }}
              >
                <Mic size={22} style={{ color: isLightMode ? "#3f3f3f" : BRAND_GOLD }} />
              </div>

              <h3
                className="text-[22px] uppercase tracking-[0.22em] mb-3"
                style={{
                  fontFamily: "var(--font-gilda)",
                  color: isLightMode ? "#111111" : "white",
                }}
              >
                Voice
              </h3>

              <p className={`text-[12px] leading-relaxed mb-8 ${theme.subtle}`}>
                Speak naturally, your final phrases will appear in the main input.
              </p>

              {voiceError && (
                <p className="text-[12px] mb-6" style={{ color: isLightMode ? "#8a2a2a" : "#ffb3b3" }}>
                  {voiceError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopVoiceVision : startVoiceVision}
                  className="flex-1 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase border transition-all"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    borderColor: isLightMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.14)",
                    background: isListening
                      ? isLightMode
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(255,255,255,0.06)"
                      : "transparent",
                    color: isLightMode ? "#111111" : "white",
                  }}
                >
                  {isListening ? "Stop" : "Start"}
                </button>

                <button
                  onClick={() => {
                    setShowVoiceOverlay(false);
                    textareaRef.current?.focus();
                  }}
                  className="flex-1 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase transition-all"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    background: BRAND_GOLD,
                    color: "#111111",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH GATE */}
      <AnimatePresence>
        {showAuthGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
          >
            <div
              className="w-full max-w-lg border p-10 rounded-[28px] shadow-2xl relative"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <button
                onClick={() => setShowAuthGate(false)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
              >
                <X size={18} style={{ color: iconColor }} />
              </button>

              <h3
                className="text-[22px] mb-3"
                style={{ fontFamily: "var(--font-gilda)" }}
              >
                Continue with an account
              </h3>

              <p className={`text-[13px] mb-8 ${theme.subtle}`} style={{ fontFamily: "var(--font-nunito)" }}>
                Save conversations, keep your history, and unlock the full concierge experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://taigenic.ai/signup/couples"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{
                    background: BRAND_GOLD,
                    color: "#111111",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  <UserPlus size={16} />
                  Register, Couples
                </a>

                <a
                  href="https://taigenic.ai/signup/business"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase border"
                  style={{
                    borderColor: isLightMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.14)",
                    color: isLightMode ? "#111111" : "white",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  <UserPlus size={16} />
                  Register, Vendors
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 text-[12px] underline underline-offset-4"
                  style={{ color: isLightMode ? "#111111" : "white" }}
                >
                  <LogIn size={14} />
                  Log in
                </a>

                <a
                  href="/forgot-password"
                  className="text-[12px] underline underline-offset-4"
                  style={{ color: isLightMode ? "#111111" : "white" }}
                >
                  Forgot password
                </a>
              </div>

              <p className={`mt-8 text-[11px] ${theme.subtle}`} style={{ fontFamily: "var(--font-nunito)" }}>
                No data is shared. Your details remain private within our platform.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGISTER CHOOSER (Header button) */}
      <AnimatePresence>
        {showRegisterChooser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[205] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
            onClick={() => setShowRegisterChooser(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm border p-8 rounded-[24px] shadow-2xl"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <h4
                className="text-[18px] mb-4"
                style={{ fontFamily: "var(--font-gilda)" }}
              >
                Register
              </h4>
              <div className="grid gap-3">
                <a
                  href="https://taigenic.ai/signup/couples"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{
                    background: BRAND_GOLD,
                    color: "#111111",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  <UserPlus size={16} />
                  Couples
                </a>
                <a
                  href="https://taigenic.ai/signup/business"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase border"
                  style={{
                    borderColor: isLightMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.14)",
                    color: isLightMode ? "#111111" : "white",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  <UserPlus size={16} />
                  Vendors
                </a>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <a
                  href="/login"
                  className="text-[12px] underline underline-offset-4"
                  style={{ color: isLightMode ? "#111111" : "white" }}
                >
                  Log in
                </a>
                <a
                  href="/forgot-password"
                  className="text-[12px] underline underline-offset-4"
                  style={{ color: isLightMode ? "#111111" : "white" }}
                >
                  Forgot password
                </a>
              </div>

              <p className={`mt-6 text-[11px] ${theme.subtle}`} style={{ fontFamily: "var(--font-nunito)" }}>
                No data is shared. Your details remain private within our platform.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 300 : 0, x: mobileSidebar && !isSidebarOpen ? -40 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`h-full border-r ${theme.border} ${theme.sidebar} flex flex-col relative shrink-0 overflow-hidden z-[100] ${
          mobileSidebar ? "fixed left-0 top-0 bottom-0" : ""
        }`}
        style={{ willChange: "width, transform" }}
      >
        <div className="p-8 flex flex-col h-full w-[300px]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center border"
                style={{ borderColor: isLightMode ? "rgba(0,0,0,0.18)" : `${BRAND_GOLD}33` }}
              >
                <Sparkles size={14} style={{ color: iconColor }} />
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.45em]"
                style={{ opacity: 0.7, fontFamily: "var(--font-nunito)" }}
              >
                Recent
              </span>
            </div>

            {mobileSidebar && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="opacity-70 hover:opacity-100"
              >
                <X size={18} style={{ color: iconColor }} />
              </button>
            )}
          </div>

          <button
            onClick={() => handleToggle(chatType)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme.border} hover:bg-black/5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all`}
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <Plus size={16} style={{ color: iconColor }} />
            New conversation
          </button>

          <div className="mt-8 space-y-2">
            {threads
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, MAX_RECENTS)
              .map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveThreadId(t.id);
                      setChatType(t.chatType);
                      if (mobileSidebar) setIsSidebarOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                    style={{
                      borderColor: active
                        ? isLightMode
                          ? "rgba(0,0,0,0.25)"
                          : `${BRAND_GOLD}55`
                        : isLightMode
                        ? "rgba(0,0,0,0.10)"
                        : "rgba(255,255,255,0.10)",
                      background: active
                        ? isLightMode
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.04)"
                        : "transparent",
                    }}
                  >
                    <div
                      className="text-[12px] font-semibold truncate"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {t.title || (t.chatType === "business" ? "For Vendors" : "For Couples")}
                    </div>
                    <div className="text-[11px] opacity-60 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                      {t.chatType === "business" ? "Atlas" : "Aura"}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="mt-auto pt-10">
            <button
              onClick={() => setShowRegisterChooser(true)}
              className="w-full px-4 py-3 rounded-full border text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
              style={{
                fontFamily: "var(--font-nunito)",
                borderColor: isLightMode ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.14)",
                color: isLightMode ? "#111111" : "white",
              }}
            >
              Register
            </button>

            <a
              href="/login"
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
              style={{
                fontFamily: "var(--font-nunito)",
                background: isLightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
                color: isLightMode ? "#111111" : "white",
              }}
            >
              <LogIn size={16} />
              Log in
            </a>
          </div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOP NAV */}
        <nav className="w-full px-6 md:px-12 py-8 flex justify-between items-center shrink-0 z-50">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar">
              <Menu size={22} style={{ color: iconColor }} />
            </button>
          </div>

          <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <h1
              className="text-[22px] md:text-[34px] uppercase leading-none tracking-tight"
              style={{
                fontFamily: "var(--font-gilda)",
                color: isLightMode ? "#111111" : "white",
              }}
            >
              5 STAR WEDDINGS
            </h1>
            <h2
              className="text-[9px] md:text-[11px] uppercase tracking-[0.55em] mt-1"
              style={{ fontFamily: "var(--font-gilda)", color: BRAND_GOLD }}
            >
              THE CONCIERGE
            </h2>
          </div>

          <div className="flex items-center gap-5 flex-1 justify-end">
            <button
              onClick={() => setIsProjectionOpen(!isProjectionOpen)}
              aria-label="Toggle projection"
              className="hidden md:inline-flex"
            >
              {isProjectionOpen ? (
                <PanelRightClose size={22} style={{ color: iconColor }} />
              ) : (
                <PanelRightOpen size={22} style={{ color: iconColor }} />
              )}
            </button>

            <button
              onClick={() => setIsLightMode(!isLightMode)}
              aria-label="Toggle theme"
              className="opacity-90 hover:opacity-100"
            >
              {isLightMode ? <Moon size={18} style={{ color: iconColor }} /> : <Sun size={18} style={{ color: iconColor }} />}
            </button>

            <button
              onClick={() => setShowRegisterChooser(true)}
              className="hidden md:inline-flex px-5 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                fontFamily: "var(--font-nunito)",
                borderColor: isLightMode ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.14)",
                color: isLightMode ? "#111111" : "white",
              }}
            >
              Register
            </button>

            <a
              href="/login"
              className="hidden md:inline-flex px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                fontFamily: "var(--font-nunito)",
                background: isLightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
                color: isLightMode ? "#111111" : "white",
              }}
            >
              Log in
            </a>

            <button
              className="w-10 h-10 rounded-full border flex items-center justify-center opacity-70"
              style={{ borderColor: isLightMode ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.12)" }}
              aria-label="Profile"
            >
              <User size={18} style={{ color: iconColor }} />
            </button>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* CHAT */}
          <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-4 border-r border-white/0">
            <div className="max-w-3xl mx-auto space-y-8 pb-[220px] pt-6">
              {/* Persona switcher (15% bigger) */}
              <div className="flex justify-center mb-10">
                <div
                  className={`flex p-1 rounded-full border backdrop-blur-md w-full max-w-md shadow-xl`}
                  style={{
                    borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)",
                    background: isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <button
                    onClick={() => handleToggle("business")}
                    className="flex-1 py-3 rounded-full text-[10px] font-semibold uppercase transition-all"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      letterSpacing: "0.18em",
                      background: chatType === "business" ? BRAND_GOLD : "transparent",
                      color: chatType === "business" ? "#111111" : isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    For Vendors
                  </button>
                  <button
                    onClick={() => handleToggle("couple")}
                    className="flex-1 py-3 rounded-full text-[10px] font-semibold uppercase transition-all"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      letterSpacing: "0.18em",
                      background: chatType === "couple" ? "rgba(24,63,52,0.95)" : "transparent",
                      color: chatType === "couple" ? "white" : isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    For Couples
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  const bubbleBg = isUser
                    ? "rgba(24,63,52,0.95)"
                    : isLightMode
                    ? "rgba(0,0,0,0.03)"
                    : "rgba(255,255,255,0.04)";

                  const bubbleBorder = isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)";

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-5 ${isUser ? "flex-row-reverse" : ""}`}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-1"
                        style={{
                          borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
                        }}
                      >
                        {isUser ? (
                          <User size={16} style={{ color: iconColor }} />
                        ) : (
                          <Sparkles size={16} style={{ color: iconColor }} />
                        )}
                      </div>

                      <div className="max-w-[76%]">
                        <div
                          className="px-6 py-4 rounded-[22px] shadow-sm border"
                          style={{
                            background: bubbleBg,
                            borderColor: bubbleBorder,
                            color: isUser ? "white" : isLightMode ? "#111111" : "white",
                            fontFamily: "var(--font-gilda)",
                            fontSize: "16px",
                            lineHeight: "1.55",
                          }}
                        >
                          {m.content}
                        </div>

                        {/* Actions under assistant only */}
                        {!isUser && (
                          <div className="mt-3 flex items-center gap-4">
                            <button
                              onClick={() => onCopy(m.content)}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                              aria-label="Copy"
                            >
                              <Copy size={16} style={{ color: actionIconColor }} />
                            </button>

                            <button
                              onClick={() => onShare(m.content)}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                              aria-label="Share"
                            >
                              <Share2 size={16} style={{ color: actionIconColor }} />
                            </button>

                            <button
                              onClick={() => setFeedback(m.id, "up")}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                              aria-label="Like"
                            >
                              <ThumbsUp
                                size={16}
                                style={{
                                  color:
                                    m.feedback === "up"
                                      ? isLightMode
                                        ? "#111111"
                                        : BRAND_GOLD
                                      : actionIconColor,
                                }}
                              />
                            </button>

                            <button
                              onClick={() => setFeedback(m.id, "down")}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                              aria-label="Dislike"
                            >
                              <ThumbsDown
                                size={16}
                                style={{
                                  color:
                                    m.feedback === "down"
                                      ? isLightMode
                                        ? "#111111"
                                        : BRAND_GOLD
                                      : actionIconColor,
                                }}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator while loading */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="flex gap-5"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-1"
                      style={{
                        borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
                      }}
                    >
                      <Sparkles size={16} style={{ color: iconColor }} />
                    </div>

                    <div
                      className="px-6 py-4 rounded-[22px] shadow-sm border"
                      style={{
                        background: isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                        borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
                        fontFamily: "var(--font-gilda)",
                        fontSize: "16px",
                        lineHeight: "1.55",
                      }}
                    >
                      {chatType === "business" ? "Atlas is thinking" : "Aura is thinking"}
                      <span className="inline-block ml-2">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse">.</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* PROJECTION CANVAS */}
          <AnimatePresence>
            {isProjectionOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "40%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden lg:flex flex-col p-10 gap-8 overflow-y-auto border-l"
                style={{
                  borderColor: isLightMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
                  background: isLightMode ? "#ffffff" : "#070707",
                }}
              >
                <h3
                  className="text-[10px] font-semibold uppercase tracking-[0.5em] opacity-60 px-2"
                  style={{ fontFamily: "var(--font-nunito)", color: isLightMode ? "#6b6b6b" : "rgba(255,255,255,0.55)" }}
                >
                  Projection Canvas
                </h3>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-2">
                  {(chatType === "couple" ? auraPlaceholders : atlasPlaceholders).map((url) => (
                    <motion.div
                      key={url}
                      whileHover={{ scale: 1.01 }}
                      className="aspect-[4/5] rounded-[26px] overflow-hidden relative border shadow-sm"
                      style={{
                        borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
                      }}
                    >
                      <img
                        src={url}
                        alt="Vision Projection"
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = "none";
                          const parent = el.parentElement;
                          if (parent) parent.style.background = isLightMode ? "linear-gradient(180deg,#f2f2f2,#e6e6e6)" : "linear-gradient(180deg,#111,#0b0b0b)";
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />
                    </motion.div>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT + FOOTER */}
        <footer className="absolute bottom-0 left-0 w-full pb-10 pt-10">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            {showRegisterNudge && !showAuthGate && (
              <div
                className="mb-4 rounded-2xl border px-4 py-3 text-[12px] flex items-center justify-between gap-3"
                style={{
                  borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)",
                  background: isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                  color: isLightMode ? "#111111" : "white",
                  fontFamily: "var(--font-nunito)",
                }}
              >
                <span>Register to save your conversation and continue.</span>
                <button
                  onClick={() => setShowRegisterChooser(true)}
                  className="underline underline-offset-4"
                  style={{ color: isLightMode ? "#111111" : "white" }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Chat input: thinner, centered, dark grey outline on light mode */}
            <div
              className="rounded-[34px] border flex items-center gap-4 px-5 py-3 shadow-sm"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.80)",
                borderColor: isLightMode ? "rgba(0,0,0,0.35)" : `${BRAND_GOLD}66`,
              }}
            >
              <button
                onClick={() => setShowVoiceOverlay(true)}
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label="Voice"
              >
                <Mic size={18} style={{ color: isLightMode ? "#3f3f3f" : BRAND_GOLD }} />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={chatType === "business" ? "Tell Atlas what you want to achieve." : "Tell Aura what you are creating."}
                className="flex-1 bg-transparent outline-none resize-none leading-[1.4] pt-[2px]"
                style={{
                  height: 44,
                  fontFamily: "var(--font-gilda)",
                  fontSize: 16,
                  color: isLightMode ? "#111111" : "white",
                }}
              />

              <button
                onClick={handleSend}
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
                style={{ background: BRAND_GOLD }}
                aria-label="Send"
              >
                <ArrowUp size={20} style={{ color: "#111111" }} />
              </button>
            </div>

            <div
              className="mt-7 text-[12px] text-center"
              style={{
                fontFamily: "var(--font-nunito)",
                color: isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.50)",
              }}
            >
              © 2026 5 Star Weddings, Concierge Platform. Powered by Taigenic.ai ·{" "}
              <a href="/cookie-preferences" className="underline underline-offset-4">
                Cookie Preferences
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
