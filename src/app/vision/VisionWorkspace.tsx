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
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Share2,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  UserPlus,
  RefreshCcw,
  Pencil,
  Check,
  GitBranch,
  ChevronLeft,
  ChevronRight,
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

type GalleryItem = {
  url: string;
  label: string;
};

const STORAGE_KEY = "taigenic_vision_threads_v1";
const MAX_RECENTS = 4;

const BRAND_GOLD = "#c6a157";

/* Subtle product label */
const PRODUCT_LABEL = "Taigenic.ai";
const PRODUCT_VERSION = "v1.01";

/* Auth gate cooldown */
const GATE_DISMISS_KEY = "taigenic_vision_gate_dismissed_at";
const GATE_COOLDOWN_MS = 1000 * 60 * 30;

/* Gallery on, off */
const GALLERY_PREF_KEY = "taigenic_vision_gallery_on_v1";

/* Follow ups dock on, off */
const FOLLOWUPS_PREF_KEY = "taigenic_vision_followups_dock_on_v1";

function gateDismissedRecently() {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(GATE_DISMISS_KEY);
    const ts = raw ? Number(raw) : 0;
    if (!ts) return false;
    return Date.now() - ts < GATE_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function setGateDismissedNow() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GATE_DISMISS_KEY, String(Date.now()));
  } catch {}
}

function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* Follow ups */
function normalizeFollowUps(items: any, max = 3) {
  const arr = Array.isArray(items) ? items : [];
  const clean = arr
    .map((x) => String(x ?? "").trim())
    .filter((x) => x.length >= 6)
    .filter((x) => x.length <= 120);

  const uniq: string[] = [];
  for (const s of clean) {
    const key = s.toLowerCase();
    if (!uniq.some((u) => u.toLowerCase() === key)) uniq.push(s);
    if (uniq.length >= max) break;
  }
  return uniq;
}

function fallbackFollowUps(chatType: ChatType, lastAssistantText: string, history: Message[]) {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
  const a = (lastAssistantText || "").toLowerCase();
  const u = (lastUser || "").toLowerCase();

  const wantsBudget = a.includes("budget") || u.includes("budget") || a.includes("spend");
  const wantsDates = a.includes("date") || a.includes("when") || u.includes("date") || u.includes("when");
  const wantsLocation = a.includes("where") || u.includes(" in ") || u.includes(" near ");

  if (chatType === "business") {
    const picks: string[] = [];
    if (wantsLocation) picks.push("Here is my location, seasonality, and ideal client, what positioning do you recommend?");
    if (wantsBudget) picks.push("Suggest a premium offer structure and how to price it for high value enquiries.");
    if (wantsDates) picks.push("Outline next steps and a timeline to go live, including assets you need from us.");

    picks.push("Draft a short luxury brand summary for my venue or service that I can use on our listing.");
    picks.push("What would you change on my website to increase qualified enquiries and conversions?");
    picks.push("Create a concierge style lead capture script for my team, including qualification questions.");

    return normalizeFollowUps(picks, 3);
  }

  const picks: string[] = [];
  if (wantsLocation) picks.push("Based on my location and style, suggest 5 venues and why they fit.");
  if (wantsDates) picks.push("Build a wedding timeline from today to the wedding day, including key booking moments.");
  if (wantsBudget) picks.push("Help me set a realistic budget breakdown, venue, planner, styling, and photography.");

  picks.push("Create a shortlist plan, venue, planner, photographer, and styling, with next steps.");
  picks.push("Write the questions I should ask a venue and a planner before booking.");
  picks.push("Give me three mood directions and a refined palette that feels elevated.");

  return normalizeFollowUps(picks, 3);
}

/* Streaming helpers */
type StreamResult = {
  text: string;
  followUps?: any;
  projection?: any;
};

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function readAsJsonOrText(res: Response) {
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    const j = await res.json();
    return { kind: "json" as const, json: j, text: "" };
  }
  const t = await res.text();
  return { kind: "text" as const, json: null, text: t };
}

/**
 * Accepts:
 * 1) text/event-stream (SSE) where each data line can be plain text or JSON
 * 2) application/x-ndjson where each line is JSON
 * 3) text/plain chunked stream
 * Falls back to JSON response
 */
async function streamVision(
  payload: any,
  onDelta: (delta: string) => void,
  onMeta: (meta: { followUps?: any; projection?: any }) => void
): Promise<StreamResult> {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const fallback = await readAsJsonOrText(res);
    if (fallback.kind === "json") {
      const replyText = String(fallback.json?.reply || "Connection interrupted.").trim();
      return { text: replyText, followUps: fallback.json?.followUps, projection: fallback.json?.projection };
    }
    return { text: (fallback.text || "Connection interrupted.").trim() };
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const canStream =
    !!res.body &&
    (ct.includes("text/event-stream") || ct.includes("application/x-ndjson") || ct.includes("text/plain"));

  if (!canStream) {
    const json = await res.json().catch(() => null);
    const replyText = String(json?.reply || "Connection interrupted.").trim();
    onMeta({
      followUps: json?.followUps ?? json?.suggestedFollowUps ?? json?.suggestions ?? null,
      projection: json?.projection ?? null,
    });
    return { text: replyText, followUps: json?.followUps, projection: json?.projection };
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  let full = "";
  let buffer = "";
  let followUps: any = null;
  let projection: any = null;

  const flushTextDelta = (delta: string) => {
    const clean = String(delta || "");
    if (!clean) return;
    full += clean;
    onDelta(clean);
  };

  const handleJsonEvent = (obj: any) => {
    if (!obj) return;
    const type = String(obj.type || obj.event || "").toLowerCase();

    if (typeof obj.delta === "string") {
      flushTextDelta(obj.delta);
      return;
    }
    if (typeof obj.text === "string" && (type === "delta" || type === "message" || type === "content")) {
      flushTextDelta(obj.text);
      return;
    }
    if (typeof obj.reply === "string" && !full) {
      flushTextDelta(obj.reply);
    }
    if (obj.followUps || obj.suggestedFollowUps || obj.suggestions) {
      followUps = obj.followUps ?? obj.suggestedFollowUps ?? obj.suggestions;
      onMeta({ followUps });
    }
    if (obj.projection) {
      projection = obj.projection;
      onMeta({ projection });
    }
  };

  const parseSse = () => {
    while (true) {
      const idx = buffer.indexOf("\n\n");
      if (idx === -1) break;
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      const lines = rawEvent.split("\n");
      const dataLines = lines
        .map((l) => l.trimEnd())
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.replace(/^data:\s?/, ""));

      const data = dataLines.join("\n").trim();
      if (!data) continue;

      const maybeObj = safeJsonParse(data);
      if (maybeObj) {
        handleJsonEvent(maybeObj);
      } else {
        if (data === "[DONE]") continue;
        flushTextDelta(data);
      }
    }
  };

  const parseNdjson = () => {
    let nl = buffer.indexOf("\n");
    while (nl !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line) {
        const obj = safeJsonParse(line);
        if (obj) handleJsonEvent(obj);
      }
      nl = buffer.indexOf("\n");
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    if (ct.includes("text/event-stream")) {
      buffer += chunk;
      parseSse();
      continue;
    }

    if (ct.includes("application/x-ndjson")) {
      buffer += chunk;
      parseNdjson();
      continue;
    }

    flushTextDelta(chunk);
  }

  onMeta({ followUps, projection });
  return { text: full.trim(), followUps, projection };
}

/* Smart Projection Canvas helpers */
function extractFirstMatch(text: string, re: RegExp) {
  const m = text.match(re);
  return m ? String(m[0]).trim() : "";
}

function extractGroup(text: string, re: RegExp, groupIndex = 1) {
  const m = text.match(re);
  return m && m[groupIndex] ? String(m[groupIndex]).trim() : "";
}

function titleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferFileLabel(url: string, fallback: string) {
  try {
    const u = new URL(url);
    const last = (u.pathname || "").split("/").filter(Boolean).pop() || "";
    const clean = decodeURIComponent(last).trim();
    return clean || fallback;
  } catch {
    const trimmed = String(url || "").split("?")[0].split("#")[0];
    const last = trimmed.split("/").filter(Boolean).pop() || "";
    return last || fallback;
  }
}

function shortLabel(s: string, max = 34) {
  const clean = String(s || "").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 3))}...`;
}

export default function VisionWorkspace() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // viewport
  const [viewportW, setViewportW] = useState(1200);

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

  // Streaming UX
  const [hasStreamedAny, setHasStreamedAny] = useState(false);

  // Editing (message editing)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  // Suggested follow ups
  const [followUps, setFollowUps] = useState<string[]>([]);

  // Follow ups dock
  const [followUpsDockEnabled, setFollowUpsDockEnabled] = useState(true);
  const [followUpsDockOpen, setFollowUpsDockOpen] = useState(true);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Gallery
  const [showGallery, setShowGallery] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Lightbox carousel
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Cloud sync debounce
  const syncTimerRef = useRef<number | null>(null);

  const personaName = chatType === "business" ? "Atlas" : "Aura";

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const clearFollowUps = () => setFollowUps([]);

  const applyFollowUps = (maybe: any, assistantText: string, history: Message[], type: ChatType) => {
    const normalized =
      normalizeFollowUps(maybe, 3).length > 0
        ? normalizeFollowUps(maybe, 3)
        : fallbackFollowUps(type, assistantText, history);

    setFollowUps(normalized);
  };

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

  const dividerColor = useMemo(() => {
    return isLightMode ? "rgba(0,0,0,0.12)" : `${BRAND_GOLD}55`;
  }, [isLightMode]);

  const currentThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  const messages = currentThread?.messages || [];

  const userTurns = useMemo(() => {
    return messages.filter((m) => m.role === "user").length;
  }, [messages]);

  const showRegisterNudge = useMemo(() => {
    return !isAuthed && userTurns >= 2 && !gateDismissedRecently();
  }, [isAuthed, userTurns]);

  const mobileSidebar = viewportW < 1024;
  const isNarrow = viewportW < 640;

  // Gallery items
  const auraGallery = useMemo<GalleryItem[]>(
    () => {
      const urls = [
        "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1523438097201-512ae7c5c0f6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1529635444937-70d1a2ce69b8?auto=format&fit=crop&w=1200&q=80",
      ];
      return urls.map((url, i) => {
        const raw = inferFileLabel(url, `aura_${String(i + 1).padStart(2, "0")}.jpg`);
        return { url, label: shortLabel(raw, 40) };
      });
    },
    []
  );

  const atlasGallery = useMemo<GalleryItem[]>(
    () => {
      const urls = [
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      ];
      return urls.map((url, i) => {
        const raw = inferFileLabel(url, `atlas_${String(i + 1).padStart(2, "0")}.jpg`);
        return { url, label: shortLabel(raw, 40) };
      });
    },
    []
  );

  const introText = useMemo(() => {
    if (chatType === "business") {
      return "Welcome. Atlas online. Share your venue or service, I will guide how we connect you to destination couples within 5 Star Weddings, shape your positioning, and outline next steps to work with us. If you prefer, I can pass your details to the right person.";
    }
    return "Welcome. Aura online. Share what you are creating, I will curate venues and recommended vendors within 5 Star Weddings, then guide you from first idea to final detail. If you prefer, I can pass your details to the right person.";
  }, [chatType]);

  const projection = useMemo(() => {
    const text = messages.map((m) => m.content).join("\n");

    const money = extractFirstMatch(text, /(?:£|\$|€)\s?\d[\d,]*(?:\.\d{1,2})?/g);
    const guests = extractGroup(text, /(\d{2,4})\s*(?:guests|people|pax)\b/i, 1);
    const month =
      extractGroup(
        text,
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
        1
      ) || "";
    const year = extractGroup(text, /\b(20\d{2})\b/, 1) || "";

    const dateHint = month ? `${titleCase(month)}${year ? ` ${year}` : ""}` : year ? year : "";

    const loc =
      extractGroup(text, /\b(?:in|at|near)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})\b/, 1) ||
      extractGroup(text, /\b(?:amalfi|como|tuscany|sicily|paris|london|dubai|doha|rome|milan)\b/i, 0) ||
      "";

    const moodWords = [
      "classic",
      "modern",
      "minimal",
      "romantic",
      "editorial",
      "black tie",
      "garden",
      "coastal",
      "villa",
      "chateau",
      "palace",
      "intimate",
      "grand",
      "glamour",
    ];

    const mood = moodWords
      .filter((w) => text.toLowerCase().includes(w))
      .slice(0, 4)
      .map((w) => titleCase(w));

    const bizWords = ["weddings", "events", "venue", "hotel", "planner", "photography", "catering", "florist", "fireworks"];
    const biz = bizWords
      .filter((w) => text.toLowerCase().includes(w))
      .slice(0, 4)
      .map((w) => titleCase(w));

    const quickCards =
      chatType === "couple"
        ? [
            { k: "Location", v: loc || "Not set" },
            { k: "Date", v: dateHint || "Not set" },
            { k: "Guests", v: guests ? `${guests}` : "Not set" },
            { k: "Budget", v: money || "Not set" },
          ]
        : [
            { k: "Market", v: loc || "Not set" },
            { k: "Launch", v: dateHint || "Not set" },
            { k: "Offer", v: biz.length ? biz.join(", ") : "Not set" },
            { k: "Pricing", v: money || "Not set" },
          ];

    const tags = chatType === "couple" ? mood : biz;

    return {
      cards: quickCards,
      tags,
      next: followUps.slice(0, 3),
    };
  }, [messages, chatType, followUps]);

  const scheduleCloudSync = (threadId: string) => {
    if (!mounted) return;
    if (!isAuthed) return;

    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(async () => {
      try {
        const t = threads.find((x) => x.id === threadId);
        if (!t) return;

        await fetch("/api/vision/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thread: {
              id: t.id,
              title: t.title,
              chatType: t.chatType,
              updatedAt: t.updatedAt,
              messages: t.messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                feedback: m.feedback ?? null,
              })),
            },
          }),
        }).catch(() => null);
      } catch {}
    }, 650);
  };

  const persistFeedback = async (threadId: string, messageId: string, feedback: "up" | "down" | null) => {
    if (!mounted) return;
    if (!isAuthed) return;
    try {
      await fetch("/api/vision/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          messageId,
          feedback,
        }),
      }).catch(() => null);
    } catch {}
  };

  const scrollCarousel = (dir: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth / 2));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const openLightbox = (items: GalleryItem[], index: number) => {
    const safeIdx = clamp(index, 0, Math.max(0, items.length - 1));
    setLightboxItems(items);
    setLightboxIndex(safeIdx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const stepLightbox = (dir: "prev" | "next") => {
    const len = lightboxItems.length;
    if (len <= 1) return;
    setLightboxIndex((prev) => {
      const delta = dir === "prev" ? -1 : 1;
      const next = (prev + delta + len) % len;
      return next;
    });
  };

  useEffect(() => {
    setMounted(true);

    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    setViewportW(w);

    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", onResize);

    const initialType: ChatType = searchParams.get("chatType") === "business" ? "business" : "couple";
    setChatType(initialType);

    let loaded: Thread[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = [];
    }

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

    if (w < 1024) setIsSidebarOpen(false);

    try {
      const raw = localStorage.getItem(GALLERY_PREF_KEY);
      if (raw === "false") setShowGallery(false);
    } catch {}

    try {
      const raw = localStorage.getItem(FOLLOWUPS_PREF_KEY);
      if (raw === "false") setFollowUpsDockEnabled(false);
    } catch {}

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
            setVoiceError("Microphone permission is blocked. Please allow microphone access in your browser settings, then try again.");
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

    return () => {
      window.removeEventListener("resize", onResize);
      try {
        recognitionRef.current?.stop?.();
      } catch {}
    };
  }, [searchParams]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(GALLERY_PREF_KEY, String(showGallery));
    } catch {}
  }, [mounted, showGallery]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(FOLLOWUPS_PREF_KEY, String(followUpsDockEnabled));
    } catch {}
  }, [mounted, followUpsDockEnabled]);

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

  useEffect(() => {
    if (!mounted) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mounted, messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = clamp(el.scrollHeight, 44, 140);
    el.style.height = `${next}px`;
  }, [input]);

  useEffect(() => {
    clearFollowUps();
    setEditingId(null);
    setEditDraft("");
    setHasStreamedAny(false);
  }, [activeThreadId]);

  useEffect(() => {
    if (!mounted) return;
    if (!currentThread) return;
    if (currentThread.messages.length) return;

    clearFollowUps();

    const introId = uid("intro");
    const base: Message = { id: introId, role: "assistant", content: "" };

    setThreads((prev) =>
      prev.map((t) => (t.id === currentThread.id ? { ...t, messages: [base], updatedAt: Date.now() } : t))
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
                messages: t.messages.map((m) => (m.id === introId ? { ...m, content: partial } : m)),
                updatedAt: Date.now(),
              }
            : t
        )
      );
      if (i >= full.length) clearInterval(tick);
    }, 18);

    return () => clearInterval(tick);
  }, [mounted, currentThread?.id, introText]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepLightbox("prev");
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepLightbox("next");
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightboxItems.length]);

  useEffect(() => {
    if (!followUpsDockEnabled) return;
    if (followUps.length > 0) setFollowUpsDockOpen(true);
  }, [followUpsDockEnabled, followUps.length]);

  if (!mounted) return <div className="h-screen w-full bg-[#070707]" />;

  const setThreadMessages = (threadId: string, nextMessages: Message[]) => {
    setThreads((prev) =>
      prev
        .map((t) => (t.id === threadId ? { ...t, messages: nextMessages, updatedAt: Date.now() } : t))
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENTS)
    );
  };

  const updateAssistantContent = (threadId: string, assistantId: string, content: string) => {
    setThreads((prev) =>
      prev
        .map((t) => {
          if (t.id !== threadId) return t;
          const msgs = t.messages.map((m) => (m.id === assistantId ? { ...m, content } : m));
          return { ...t, messages: msgs, updatedAt: Date.now() };
        })
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENTS)
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const startEdit = (messageId: string, content: string) => {
    if (loading) return;
    clearFollowUps();
    setEditingId(messageId);
    setEditDraft(content);
  };

  const saveEdit = (messageId: string) => {
    if (!currentThread) return;
    const idx = currentThread.messages.findIndex((m) => m.id === messageId);
    if (idx < 0) return;

    const clean = String(editDraft || "").trim();
    if (!clean) {
      showToast("Message cannot be empty");
      return;
    }

    const updatedSlice = currentThread.messages
      .slice(0, idx + 1)
      .map((m) => (m.id === messageId ? { ...m, content: clean } : m));

    setThreadMessages(currentThread.id, updatedSlice);
    cancelEdit();
    clearFollowUps();
    showToast("Message updated");

    scheduleCloudSync(currentThread.id);
  };

  const handleToggle = (type: ChatType) => {
    clearFollowUps();
    cancelEdit();
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

    if (viewportW < 1024) {
      setIsSidebarOpen(false);
    }

    scheduleCloudSync(t.id);
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

  const closeVoiceOverlay = () => {
    if (isListening) stopVoiceVision();
    setShowVoiceOverlay(false);
  };

  const openAuthGate = () => {
    setShowAuthGate(true);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!currentThread) return;

    if (!isAuthed && userTurns >= 3 && !gateDismissedRecently()) {
      openAuthGate();
      return;
    }

    if (isListening) stopVoiceVision();

    clearFollowUps();
    cancelEdit();
    setHasStreamedAny(false);

    const userMsg: Message = { id: uid("u"), role: "user", content: input.trim() };
    const assistantId = uid("a");
    const assistantStub: Message = { id: assistantId, role: "assistant", content: "" };

    const base: Message[] = [...messages, userMsg];
    const next: Message[] = [...base, assistantStub];

    setInput("");
    setThreadMessages(currentThread.id, next);
    setLoading(true);

    try {
      let currentText = "";

      const payload = {
        chatType,
        messages: base.map((m) => ({ role: m.role, content: m.content })),
        userTurns: userTurns + 1,
      };

      const result = await streamVision(
        payload,
        (delta) => {
          if (!hasStreamedAny) setHasStreamedAny(true);
          currentText += delta;
          updateAssistantContent(currentThread.id, assistantId, currentText);
        },
        (meta) => {
          const maybe = meta.followUps ?? null;
          if (maybe) {
            const partialAssistant: Message = { ...assistantStub, content: currentText };
            const partialHistory: Message[] = [...base, partialAssistant];
            applyFollowUps(maybe, currentText, partialHistory, chatType);
          }
        }
      );

      const finalText = String(result.text || currentText || "Connection interrupted.").trim();
      updateAssistantContent(currentThread.id, assistantId, finalText);

      const finalAssistant: Message = { id: assistantId, role: "assistant", content: finalText };
      const finalMsgs: Message[] = [...base, finalAssistant];

      const maybe = result.followUps ?? null;
      applyFollowUps(maybe, finalText, finalMsgs, chatType);

      scheduleCloudSync(currentThread.id);
    } catch {
      updateAssistantContent(currentThread.id, assistantId, "Connection interrupted.");
      clearFollowUps();
    } finally {
      setLoading(false);
      setHasStreamedAny(false);
    }
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied");
    } catch {
      showToast("Copy failed");
    }
  };

  const onShare = async (text: string) => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ text });
        showToast("Shared");
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast("Copied");
    } catch {
      showToast("Share failed");
    }
  };

  const setFeedback = (messageId: string, value: "up" | "down") => {
    if (!currentThread) return;
    const next = messages.map((m) => (m.id === messageId ? { ...m, feedback: m.feedback === value ? null : value } : m));
    setThreadMessages(currentThread.id, next);

    const nextValue = next.find((m) => m.id === messageId)?.feedback ?? null;
    persistFeedback(currentThread.id, messageId, nextValue);
    scheduleCloudSync(currentThread.id);
  };

  const branchFrom = (messageId: string) => {
    if (!currentThread) return;

    const idx = currentThread.messages.findIndex((m) => m.id === messageId);
    if (idx < 0) return;

    const slice = currentThread.messages.slice(0, idx + 1);
    const who = currentThread.chatType === "business" ? "Atlas" : "Aura";

    const t: Thread = {
      id: uid("t"),
      title: `Branch, ${who}`,
      chatType: currentThread.chatType,
      messages: slice,
      updatedAt: Date.now(),
    };

    clearFollowUps();
    cancelEdit();
    setThreads((prev) => [t, ...prev].slice(0, MAX_RECENTS));
    setActiveThreadId(t.id);

    if (viewportW < 1024) {
      setIsSidebarOpen(false);
    }

    showToast("Branch created");
    scheduleCloudSync(t.id);
  };

  const regenerateFrom = async (assistantMessageId: string) => {
    if (!currentThread) return;
    if (loading) return;

    const idx = currentThread.messages.findIndex((m) => m.id === assistantMessageId);
    if (idx < 0) return;

    const target = currentThread.messages[idx];
    if (target.role !== "assistant") return;

    const base: Message[] = currentThread.messages.slice(0, idx);
    const nextUserTurns = base.filter((m) => m.role === "user").length;

    if (isListening) stopVoiceVision();

    clearFollowUps();
    cancelEdit();
    setHasStreamedAny(false);

    const newAssistantId = uid("a");
    const assistantStub: Message = { id: newAssistantId, role: "assistant", content: "" };

    setThreadMessages(currentThread.id, [...base, assistantStub]);
    setLoading(true);

    try {
      let currentText = "";

      const payload = {
        chatType: currentThread.chatType,
        messages: base.map((m) => ({ role: m.role, content: m.content })),
        userTurns: nextUserTurns,
      };

      const result = await streamVision(
        payload,
        (delta) => {
          if (!hasStreamedAny) setHasStreamedAny(true);
          currentText += delta;
          updateAssistantContent(currentThread.id, newAssistantId, currentText);
        },
        () => {}
      );

      const finalText = String(result.text || currentText || "Connection interrupted.").trim();

      const finalAssistant: Message = { id: newAssistantId, role: "assistant", content: finalText };
      const finalMsgs: Message[] = [...base, finalAssistant];

      setThreadMessages(currentThread.id, finalMsgs);

      const maybe = result.followUps ?? null;
      applyFollowUps(maybe, finalText, finalMsgs, currentThread.chatType);

      showToast("Response regenerated");
      scheduleCloudSync(currentThread.id);
    } catch {
      const failAssistant: Message = { ...assistantStub, content: "Connection interrupted." };
      setThreadMessages(currentThread.id, [...base, failAssistant]);
      clearFollowUps();
      showToast("Regenerate failed");
    } finally {
      setLoading(false);
      setHasStreamedAny(false);
    }
  };

  const arrowColor = isLightMode ? "#111111" : BRAND_GOLD;
  const arrowBorder = isLightMode ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.14)";
  const arrowBg = isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.06)";

  const dockLeft = isNarrow ? 14 : isSidebarOpen && !mobileSidebar ? 312 : 14;
  const dockTop = isNarrow ? undefined : 184;
  const dockBottom = isNarrow ? 150 : undefined;

  const showDock =
    (followUpsDockEnabled && followUps.length > 0 && !loading && !editingId && !showAuthGate && !showVoiceOverlay) ||
    (!followUpsDockEnabled && !showAuthGate && !showVoiceOverlay);

  const dockTitle = chatType === "business" ? "Atlas ideas" : "Aura ideas";

  const dockPanelBg = isLightMode ? "rgba(255,255,255,0.96)" : "rgba(14,14,14,0.86)";
  const dockPanelBorder = isLightMode ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const dockText = isLightMode ? "#111111" : "white";
  const dockSubtle = isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";

  return (
    <div className={`h-screen w-full flex ${theme.bg} ${theme.text} overflow-hidden relative`} style={{ fontFamily: "var(--font-nunito)" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-6 z-[300] rounded-full border px-4 py-2 text-[12px] shadow-lg"
            style={{
              fontFamily: "var(--font-nunito)",
              background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
              borderColor: isLightMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)",
              color: isLightMode ? "#111111" : "white",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* FLOATING FOLLOW UPS DOCK (left, on off) */}
      <AnimatePresence>
        {showDock && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed z-[160]"
            style={{
              left: dockLeft,
              top: dockTop,
              bottom: dockBottom,
              width: isNarrow ? 240 : 270,
            }}
          >
            {followUpsDockOpen ? (
              <div
                className="rounded-[22px] border shadow-2xl overflow-hidden"
                style={{
                  background: dockPanelBg,
                  borderColor: dockPanelBorder,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="px-4 py-3 flex items-center justify-between gap-3 border-b" style={{ borderColor: dockPanelBorder }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: dockPanelBorder }}
                    >
                      <Sparkles size={14} style={{ color: iconColor }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[11px] font-semibold uppercase tracking-[0.22em] truncate"
                        style={{ fontFamily: "var(--font-nunito)", color: dockText }}
                        title={dockTitle}
                      >
                        {dockTitle}
                      </div>
                      <div className="text-[11px] truncate" style={{ fontFamily: "var(--font-nunito)", color: dockSubtle }}>
                        {followUpsDockEnabled ? (followUps.length ? `${followUps.length} suggestions` : "Ready") : "Off"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !followUpsDockEnabled;
                        setFollowUpsDockEnabled(next);
                        if (next) setFollowUpsDockOpen(true);
                        showToast(next ? "Suggestions on" : "Suggestions off");
                      }}
                      className="px-3 h-8 rounded-full border text-[10px] font-semibold uppercase tracking-[0.22em] opacity-95 hover:opacity-100"
                      style={{
                        fontFamily: "var(--font-nunito)",
                        borderColor: dockPanelBorder,
                        background: followUpsDockEnabled ? "rgba(198,161,87,0.25)" : "transparent",
                        color: dockText,
                      }}
                      aria-label="Toggle suggestions"
                      title="Toggle"
                    >
                      {followUpsDockEnabled ? "On" : "Off"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFollowUpsDockOpen(false)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center opacity-80 hover:opacity-100"
                      style={{ borderColor: dockPanelBorder, color: dockText }}
                      aria-label="Hide dock"
                      title="Hide"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {followUpsDockEnabled ? (
                    followUps.length > 0 ? (
                      <div className="space-y-2">
                        {followUps.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setInput(s);
                              clearFollowUps();
                              textareaRef.current?.focus();
                              showToast("Inserted");
                            }}
                            className="w-full text-left px-4 py-3 rounded-[18px] border text-[12px] transition-all hover:opacity-95"
                            style={{
                              fontFamily: "var(--font-nunito)",
                              borderColor: isLightMode ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.14)",
                              background: isLightMode ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.06)",
                              color: isLightMode ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.90)",
                              lineHeight: 1.35,
                            }}
                            title="Use suggestion"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[12px]" style={{ fontFamily: "var(--font-nunito)", color: dockSubtle }}>
                        Suggestions will appear here after a reply.
                      </div>
                    )
                  ) : (
                    <div className="text-[12px]" style={{ fontFamily: "var(--font-nunito)", color: dockSubtle }}>
                      Suggestions are off. Toggle on to show them.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setFollowUpsDockOpen(true)}
                  className="w-full rounded-full border px-4 py-3 flex items-center justify-between shadow-lg"
                  style={{
                    background: dockPanelBg,
                    borderColor: dockPanelBorder,
                    color: dockText,
                    backdropFilter: "blur(10px)",
                    fontFamily: "var(--font-nunito)",
                  }}
                  aria-label="Open suggestions"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Sparkles size={14} style={{ color: iconColor }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] truncate">Ideas</span>
                  </span>
                  <span className="text-[11px]" style={{ color: dockSubtle }}>
                    {followUpsDockEnabled ? (followUps.length ? followUps.length : "") : "Off"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !followUpsDockEnabled;
                    setFollowUpsDockEnabled(next);
                    if (next) setFollowUpsDockOpen(true);
                    showToast(next ? "Suggestions on" : "Suggestions off");
                  }}
                  className="w-full rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] shadow-lg"
                  style={{
                    background: dockPanelBg,
                    borderColor: dockPanelBorder,
                    color: dockText,
                    backdropFilter: "blur(10px)",
                    fontFamily: "var(--font-nunito)",
                  }}
                  aria-label="Toggle suggestions"
                >
                  {followUpsDockEnabled ? "Turn off" : "Turn on"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VOICE OVERLAY */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
            <div
              className="w-full max-w-md border p-10 rounded-[28px] text-center shadow-2xl relative"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <button onClick={closeVoiceOverlay} className="absolute top-6 right-6 opacity-50 hover:opacity-100">
                <X size={18} style={{ color: iconColor }} />
              </button>

              <div className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-6" style={{ borderColor: isLightMode ? "rgba(0,0,0,0.25)" : `${BRAND_GOLD}66` }}>
                <Mic size={22} style={{ color: isLightMode ? "#3f3f3f" : BRAND_GOLD }} />
              </div>

              <h3 className="text-[22px] uppercase tracking-[0.22em] mb-2" style={{ fontFamily: "var(--font-gilda)", color: isLightMode ? "#111111" : "white" }}>
                {personaName} Voice
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
                    background: isListening ? (isLightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)") : "transparent",
                    color: isLightMode ? "#111111" : "white",
                  }}
                >
                  {isListening ? "Stop" : "Start"}
                </button>

                <button
                  onClick={() => {
                    closeVoiceOverlay();
                    textareaRef.current?.focus();
                  }}
                  className="flex-1 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase transition-all"
                  style={{ fontFamily: "var(--font-nunito)", background: BRAND_GOLD, color: "#111111" }}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
            <div
              className="w-full max-w-lg border p-10 rounded-[28px] shadow-2xl relative"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <button
                onClick={() => {
                  setGateDismissedNow();
                  setShowAuthGate(false);
                }}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
              >
                <X size={18} style={{ color: iconColor }} />
              </button>

              <h3 className="text-[22px] mb-3" style={{ fontFamily: "var(--font-gilda)" }}>
                Continue with an account
              </h3>

              <p className={`text-[13px] mb-8 ${theme.subtle}`} style={{ fontFamily: "var(--font-nunito)" }}>
                Save conversations, keep your history, and unlock the full concierge experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://taigenic.ai/signup/couples"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{ background: BRAND_GOLD, color: "#111111", fontFamily: "var(--font-nunito)" }}
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

                <a href="/forgot-password" className="text-[12px] underline underline-offset-4" style={{ color: isLightMode ? "#111111" : "white" }}>
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
            onClick={() => {
              setGateDismissedNow();
              setShowRegisterChooser(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm border p-8 rounded-[24px] shadow-2xl"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.92)",
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : `${BRAND_GOLD}33`,
              }}
            >
              <h4 className="text-[18px] mb-4" style={{ fontFamily: "var(--font-gilda)" }}>
                Register
              </h4>
              <div className="grid gap-3">
                <a
                  href="https://taigenic.ai/signup/couples"
                  className="flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{ background: BRAND_GOLD, color: "#111111", fontFamily: "var(--font-nunito)" }}
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
                <a href="/login" className="text-[12px] underline underline-offset-4" style={{ color: isLightMode ? "#111111" : "white" }}>
                  Log in
                </a>
                <a href="/forgot-password" className="text-[12px] underline underline-offset-4" style={{ color: isLightMode ? "#111111" : "white" }}>
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

      {/* IMAGE LIGHTBOX, slider, filename */}
      <AnimatePresence>
        {lightboxOpen && lightboxItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full max-w-5xl rounded-[28px] overflow-hidden border shadow-2xl relative"
              style={{
                borderColor: isLightMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.14)",
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(10,10,10,0.96)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-5 right-5 w-10 h-10 rounded-full border flex items-center justify-center opacity-80 hover:opacity-100"
                aria-label="Close"
                style={{ borderColor: arrowBorder, background: arrowBg, color: arrowColor }}
              >
                <X size={18} />
              </button>

              <button
                type="button"
                onClick={() => stepLightbox("prev")}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border flex items-center justify-center opacity-85 hover:opacity-100"
                aria-label="Previous image"
                style={{ borderColor: arrowBorder, background: arrowBg, color: arrowColor }}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => stepLightbox("next")}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border flex items-center justify-center opacity-85 hover:opacity-100"
                aria-label="Next image"
                style={{ borderColor: arrowBorder, background: arrowBg, color: arrowColor }}
              >
                <ChevronRight size={18} />
              </button>

              <div className="w-full" style={{ background: "black" }}>
                <img
                  src={lightboxItems[lightboxIndex]?.url}
                  alt="Preview"
                  className="w-full"
                  style={{ height: "72vh", objectFit: "contain" }}
                />
              </div>

              <div
                className="px-6 py-4 flex items-center justify-between gap-4 border-t"
                style={{
                  borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
                  background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(12,12,12,0.92)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ fontFamily: "var(--font-nunito)", color: isLightMode ? "#111111" : "white" }}>
                    {lightboxItems[lightboxIndex]?.label || "Image"}
                  </div>
                  <div className="text-[11px]" style={{ fontFamily: "var(--font-nunito)", color: isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }}>
                    {lightboxIndex + 1} of {lightboxItems.length}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepLightbox("prev")}
                    className="px-4 h-9 rounded-full border text-[10px] font-semibold uppercase tracking-[0.22em] opacity-90 hover:opacity-100"
                    style={{ fontFamily: "var(--font-nunito)", borderColor: arrowBorder, background: arrowBg, color: arrowColor }}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => stepLightbox("next")}
                    className="px-4 h-9 rounded-full border text-[10px] font-semibold uppercase tracking-[0.22em] opacity-90 hover:opacity-100"
                    style={{ fontFamily: "var(--font-nunito)", borderColor: arrowBorder, background: arrowBg, color: arrowColor }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 300 : 0, x: mobileSidebar && !isSidebarOpen ? -40 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`h-full border-r ${theme.border} ${theme.sidebar} flex flex-col relative shrink-0 overflow-hidden z-[100] ${mobileSidebar ? "fixed left-0 top-0 bottom-0" : ""}`}
        style={{ willChange: "width, transform" }}
      >
        <div className="p-8 flex flex-col h-full w-[300px]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: isLightMode ? "rgba(0,0,0,0.18)" : `${BRAND_GOLD}33` }}>
                <Sparkles size={14} style={{ color: iconColor }} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ opacity: 0.7, fontFamily: "var(--font-nunito)" }}>
                Recent
              </span>
            </div>

            {mobileSidebar && (
              <button onClick={() => setIsSidebarOpen(false)} className="opacity-70 hover:opacity-100">
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
                      clearFollowUps();
                      cancelEdit();
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
                      background: active ? (isLightMode ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)") : "transparent",
                    }}
                  >
                    <div className="text-[12px] font-semibold truncate" style={{ fontFamily: "var(--font-nunito)" }}>
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
        {/* TOP MENU, DIVIDER, BRANDING */}
        <header className="w-full shrink-0 z-50">
          <div className="w-full px-6 md:px-12 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" className="shrink-0">
                  <Menu size={22} style={{ color: iconColor }} />
                </button>

                <div className="min-w-0">
                  <div
                    className="text-[10px] uppercase tracking-[0.45em] truncate"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      color: isLightMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
                    }}
                    title={`${PRODUCT_LABEL} · ${PRODUCT_VERSION}`}
                  >
                    {PRODUCT_LABEL} <span style={{ opacity: 0.75 }}>· {PRODUCT_VERSION}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 justify-end">
                <button onClick={() => setIsProjectionOpen(!isProjectionOpen)} aria-label="Toggle projection" className="hidden md:inline-flex">
                  {isProjectionOpen ? <PanelRightClose size={22} style={{ color: iconColor }} /> : <PanelRightOpen size={22} style={{ color: iconColor }} />}
                </button>

                <button onClick={() => setIsLightMode(!isLightMode)} aria-label="Toggle theme" className="opacity-90 hover:opacity-100">
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
                  className="w-10 h-10 rounded-full border flex items-center justify-center opacity-70 shrink-0"
                  style={{
                    borderColor: isLightMode ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.12)",
                  }}
                  aria-label="Profile"
                >
                  <User size={18} style={{ color: iconColor }} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full px-6 md:px-12 mt-5">
            <div style={{ height: 1, width: "100%", background: dividerColor }} />
          </div>

          <div className="w-full px-6 md:px-12 pt-7 pb-7">
            <div className="text-center">
              <h1
                className="text-[22px] md:text-[34px] uppercase leading-none tracking-tight"
                style={{ fontFamily: "var(--font-gilda)", color: isLightMode ? "#111111" : "white" }}
              >
                5 STAR WEDDINGS
              </h1>
              <h2 className="text-[9px] md:text-[11px] uppercase tracking-[0.55em] mt-1" style={{ fontFamily: "var(--font-gilda)", color: BRAND_GOLD }}>
                THE CONCIERGE
              </h2>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* CHAT */}
          <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-4 border-r border-white/0">
            <div className="max-w-3xl mx-auto space-y-8 pb-[200px] pt-6">
              {/* Persona switcher */}
              <div className="flex justify-center mb-10">
                <div
                  className="flex p-1 rounded-full border backdrop-blur-md w-full max-w-md shadow-xl"
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
                  const isEditingThis = isUser && editingId === m.id;

                  const bubbleBg = isUser ? "rgba(24,63,52,0.95)" : isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)";
                  const bubbleBorder = isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)";

                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-5 ${isUser ? "flex-row-reverse" : ""}`} style={{ willChange: "transform, opacity" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-1" style={{ borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)" }}>
                        {isUser ? <User size={16} style={{ color: iconColor }} /> : <Sparkles size={16} style={{ color: iconColor }} />}
                      </div>

                      <div className="max-w-[76%]">
                        <div
                          className="px-6 py-4 rounded-[22px] shadow-sm border"
                          style={{
                            background: bubbleBg,
                            borderColor: bubbleBorder,
                            color: isUser ? "white" : isLightMode ? "#111111" : "white",
                            fontFamily: "var(--font-nunito)",
                            fontSize: "16px",
                            lineHeight: "1.55",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {isEditingThis ? (
                            <textarea
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              className="w-full bg-transparent outline-none resize-none"
                              style={{ fontFamily: "var(--font-nunito)", fontSize: 16, lineHeight: "1.55", color: "inherit", minHeight: 80 }}
                            />
                          ) : (
                            m.content
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-4">
                          {isUser ? (
                            <>
                              {isEditingThis ? (
                                <>
                                  <button onClick={() => saveEdit(m.id)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Save" title="Save">
                                    <Check size={16} style={{ color: actionIconColor }} />
                                  </button>

                                  <button onClick={cancelEdit} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Cancel" title="Cancel">
                                    <X size={16} style={{ color: actionIconColor }} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(m.id, m.content)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Edit" title="Edit">
                                    <Pencil size={16} style={{ color: actionIconColor }} />
                                  </button>

                                  <button onClick={() => branchFrom(m.id)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Branch" title="Branch">
                                    <GitBranch size={16} style={{ color: actionIconColor }} />
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <button onClick={() => onCopy(m.content)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Copy" title="Copy">
                                <Copy size={16} style={{ color: actionIconColor }} />
                              </button>

                              <button onClick={() => onShare(m.content)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Share" title="Share">
                                <Share2 size={16} style={{ color: actionIconColor }} />
                              </button>

                              <button onClick={() => setFeedback(m.id, "up")} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Like" title="Like">
                                <ThumbsUp
                                  size={16}
                                  style={{
                                    color: m.feedback === "up" ? (isLightMode ? "#111111" : BRAND_GOLD) : actionIconColor,
                                  }}
                                />
                              </button>

                              <button onClick={() => setFeedback(m.id, "down")} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Dislike" title="Dislike">
                                <ThumbsDown
                                  size={16}
                                  style={{
                                    color: m.feedback === "down" ? (isLightMode ? "#111111" : BRAND_GOLD) : actionIconColor,
                                  }}
                                />
                              </button>

                              <button onClick={() => branchFrom(m.id)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Branch" title="Branch">
                                <GitBranch size={16} style={{ color: actionIconColor }} />
                              </button>

                              <button onClick={() => regenerateFrom(m.id)} className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Regenerate" title="Regenerate" disabled={loading}>
                                <RefreshCcw size={16} style={{ color: actionIconColor }} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {loading && !hasStreamedAny && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="flex gap-5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-1" style={{ borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)" }}>
                      <Sparkles size={16} style={{ color: iconColor }} />
                    </div>

                    <div
                      className="px-6 py-4 rounded-[22px] shadow-sm border"
                      style={{
                        background: isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                        borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
                        fontFamily: "var(--font-nunito)",
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
                  fontFamily: "var(--font-nunito)",
                }}
              >
                <div className="flex items-center justify-between px-2">
                  <h3
                    className="text-[10px] font-semibold uppercase tracking-[0.5em] opacity-60"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      color: isLightMode ? "#6b6b6b" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    Projection Canvas
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGallery((v) => !v)}
                      className="px-3 h-9 rounded-full border text-[10px] font-semibold uppercase tracking-[0.22em] opacity-90 hover:opacity-100"
                      aria-label="Toggle gallery"
                      style={{
                        fontFamily: "var(--font-nunito)",
                        borderColor: arrowBorder,
                        background: showGallery ? arrowBg : "transparent",
                        color: isLightMode ? "#111111" : "white",
                      }}
                    >
                      Gallery
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollCarousel("left")}
                      disabled={!showGallery}
                      className="w-9 h-9 rounded-full border flex items-center justify-center transition-opacity"
                      aria-label="Scroll left"
                      style={{
                        borderColor: arrowBorder,
                        background: arrowBg,
                        color: arrowColor,
                        opacity: showGallery ? 0.9 : 0.35,
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollCarousel("right")}
                      disabled={!showGallery}
                      className="w-9 h-9 rounded-full border flex items-center justify-center transition-opacity"
                      aria-label="Scroll right"
                      style={{
                        borderColor: arrowBorder,
                        background: arrowBg,
                        color: arrowColor,
                        opacity: showGallery ? 0.9 : 0.35,
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Smart cards */}
                <div className="px-2">
                  <div className="grid grid-cols-2 gap-4">
                    {projection.cards.map((c) => (
                      <div
                        key={c.k}
                        className="rounded-[18px] border p-4"
                        style={{
                          borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
                          background: isLightMode ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div className="text-[10px] uppercase tracking-[0.28em] opacity-70" style={{ fontFamily: "var(--font-nunito)" }}>
                          {c.k}
                        </div>
                        <div className="mt-2 text-[14px]" style={{ fontFamily: "var(--font-nunito)", color: isLightMode ? "#111111" : "white", lineHeight: 1.35 }}>
                          {c.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  {projection.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {projection.tags.map((t) => (
                        <div
                          key={t}
                          className="px-3 py-1 rounded-full border text-[11px]"
                          style={{
                            fontFamily: "var(--font-nunito)",
                            borderColor: isLightMode ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)",
                            background: isLightMode ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.04)",
                            color: isLightMode ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)",
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}

                  {projection.next.length > 0 && (
                    <div
                      className="mt-5 rounded-[20px] border p-5"
                      style={{
                        borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
                        background: isLightMode ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="text-[10px] uppercase tracking-[0.28em] opacity-70" style={{ fontFamily: "var(--font-nunito)" }}>
                        Next steps
                      </div>
                      <div className="mt-3 space-y-2">
                        {projection.next.map((n) => (
                          <div key={n} className="text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-nunito)", color: isLightMode ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.88)" }}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2 up carousel, click opens slider */}
                {showGallery && (
                  <div ref={carouselRef} className="flex gap-6 overflow-x-auto px-2 pb-2" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                    {(chatType === "couple" ? auraGallery : atlasGallery).map((item, idx) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => openLightbox(chatType === "couple" ? auraGallery : atlasGallery, idx)}
                        className="shrink-0 text-left"
                        style={{ width: "calc((100% - 24px) / 2)", scrollSnapAlign: "start" }}
                        aria-label="Open image"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="aspect-[4/5] rounded-[26px] overflow-hidden relative border shadow-sm"
                          style={{ borderColor: isLightMode ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)" }}
                        >
                          <img
                            src={item.url}
                            alt={item.label}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            onError={(e) => {
                              const el = e.currentTarget;
                              el.style.display = "none";
                              const parent = el.parentElement;
                              if (parent) {
                                parent.style.background = isLightMode ? "linear-gradient(180deg,#f2f2f2,#e6e6e6)" : "linear-gradient(180deg,#111,#0b0b0b)";
                              }
                            }}
                          />
                          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />
                          <div
                            className="absolute left-4 right-4 bottom-4 text-[11px] truncate"
                            style={{ fontFamily: "var(--font-nunito)", color: "rgba(255,255,255,0.90)" }}
                            title={item.label}
                          >
                            {item.label}
                          </div>
                        </motion.div>
                      </button>
                    ))}
                  </div>
                )}
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
                <button onClick={() => setShowRegisterChooser(true)} className="underline underline-offset-4" style={{ color: isLightMode ? "#111111" : "white" }}>
                  Register
                </button>
              </div>
            )}

            <div
              className="rounded-[34px] border flex items-center gap-4 px-5 py-3 shadow-sm"
              style={{
                background: isLightMode ? "rgba(255,255,255,0.98)" : "rgba(18,18,18,0.80)",
                borderColor: isLightMode ? "rgba(0,0,0,0.35)" : `${BRAND_GOLD}66`,
              }}
            >
              <button onClick={() => setShowVoiceOverlay(true)} className="opacity-90 hover:opacity-100 transition-opacity" aria-label="Voice">
                <Mic size={18} style={{ color: isLightMode ? "#3f3f3f" : BRAND_GOLD }} />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (followUps.length) clearFollowUps();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={chatType === "business" ? "Tell Atlas what you want to achieve." : "Tell Aura what you are creating."}
                className="flex-1 bg-transparent outline-none resize-none leading-[1.4] pt-[2px]"
                style={{ height: 44, fontFamily: "var(--font-nunito)", fontSize: 16, color: isLightMode ? "#111111" : "white" }}
              />

              <button onClick={handleSend} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95" style={{ background: BRAND_GOLD }} aria-label="Send">
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
