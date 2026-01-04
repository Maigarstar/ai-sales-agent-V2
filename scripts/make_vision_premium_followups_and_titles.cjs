const fs = require("fs");
const path = require("path");

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileOnce(file, content) {
  ensureDir(path.dirname(file));
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Created:", file);
  } else {
    console.log("Exists:", file);
  }
}

function backup(file, suffix) {
  const bak = file + suffix;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
  return bak;
}

function removeBlock(src, begin, end) {
  const re = new RegExp(
    begin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "[\\s\\S]*?" +
      end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "g"
  );
  return src.replace(re, "");
}

/* =========================================================
   1) Add addon API, followups
   ========================================================= */
const followupsRoute = path.join(root, "src/app/api/followups/route.ts");
writeFileOnce(
  followupsRoute,
  `"use server";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function safeParseArray(raw: string): string[] {
  const t = String(raw || "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  const slice = t.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => String(x || "").replace(/\\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const reply = String(body?.reply || "").trim();
    const userMessage = String(body?.userMessage || "").trim();
    const flow = String(body?.flow || "aura").trim();

    if (!reply) {
      return NextResponse.json({ ok: false, followUps: [] }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "Return exactly 3 suggested follow up questions as a pure JSON array of strings. No numbering, no extra keys, no commentary. Keep each under 64 characters. Tone, refined luxury wedding concierge. Use British English. Avoid emojis.",
        },
        {
          role: "user",
          content: [
            "Flow: " + flow,
            "User message: " + userMessage,
            "Assistant reply: " + reply,
            "",
            "Return: [\"...\",\"...\",\"...\"]",
          ].join("\\n"),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const list = safeParseArray(raw);

    return NextResponse.json({ ok: true, followUps: list });
  } catch {
    return NextResponse.json({ ok: true, followUps: [] });
  }
}
`
);

/* =========================================================
   2) Add addon API, thread title update
   ========================================================= */
const titleRoute = path.join(root, "src/app/api/threads/[id]/title/route.ts");
writeFileOnce(
  titleRoute,
  `"use server";

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

function makeTitleFromText(text: string) {
  const clean = String(text || "")
    .replace(/\\s+/g, " ")
    .replace(/[\\u2018\\u2019\\u201C\\u201D"'\`]/g, "")
    .trim();

  if (!clean) return "Conversation";
  if (clean.length <= 56) return clean;
  return clean.slice(0, 56) + "…";
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabase();
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({} as any));
    const title = makeTitleFromText(String(body?.title || ""));

    const { error } = await supabase
      .from("threads")
      .update({ title })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || "update_failed") }, { status: 400 });
    }

    return NextResponse.json({ ok: true, title });
  } catch {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }
}
`
);

/* =========================================================
   3) Patch VisionWorkspace, add premium followups and auto title
   ========================================================= */
const visionFile = path.join(root, "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(visionFile)) {
  console.error("Not found:", visionFile);
  process.exit(1);
}

let src = fs.readFileSync(visionFile, "utf8");
const bak = backup(visionFile, ".bak_premium_followups_titles");

src = removeBlock(src, "/* PREMIUM_VISION_BEGIN */", "/* PREMIUM_VISION_END */");

// Ensure Message type has suggestions
src = src.replace(
  /type\\s+Message\\s*=\\s*\\{([\\s\\S]*?)\\};/m,
  (m, inner) => {
    if (inner.includes("suggestions?:")) return m;
    return `type Message = {${inner}\n  suggestions?: string[];\n};`;
  }
);

// If no Message type, try ChatMessage
src = src.replace(
  /type\\s+ChatMessage\\s*=\\s*\\{([\\s\\S]*?)\\};/m,
  (m, inner) => {
    if (inner.includes("suggestions?:")) return m;
    return `type ChatMessage = {${inner}\n  suggestions?: string[];\n};`;
  }
);

// Add useRef import if missing
if (!src.includes("useRef")) {
  src = src.replace(
    /import\\s+React\\s*,\\s*\\{([^}]*)\\}\\s+from\\s+["']react["'];/m,
    (m, inner) => {
      if (inner.includes("useRef")) return m;
      return `import React, {${inner.trim()}, useRef} from "react";`;
    }
  );
}

// Insert premium block right after the messages state line if possible
const messagesStateRe = /const\\s*\\[\\s*messages\\s*,\\s*setMessages\\s*\\]\\s*=\\s*useState[\\s\\S]*?;\\s*/m;
const match = src.match(messagesStateRe);

const hasActiveThreadId = src.includes("activeThreadId");
const hasSetActiveThreadId = src.includes("setActiveThreadId");

const premiumBlock = `
  /* PREMIUM_VISION_BEGIN */
  const followUpsDoneRef = useRef<Set<string>>(new Set());
  const titledThreadsRef = useRef<Set<string>>(new Set());

  function pickLastUserText(list: any[]) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list?.[i]?.role === "user") {
        const t = String(list[i]?.content || "").trim();
        if (t) return t;
      }
    }
    return "";
  }

  function makePremiumTitle(text: string) {
    const clean = String(text || "")
      .replace(/\\s+/g, " ")
      .replace(/[\\u2018\\u2019\\u201C\\u201D"'\`]/g, "")
      .trim();

    if (!clean) return "Conversation";
    if (clean.length <= 56) return clean;
    return clean.slice(0, 56) + "…";
  }

  useEffect(() => {
    // Follow ups, server generated, saved onto the last assistant message
    const lastAssistantIndex = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if ((messages as any)[i]?.role === "assistant") return i;
      }
      return -1;
    })();

    if (lastAssistantIndex < 0) return;

    const lastA: any = (messages as any)[lastAssistantIndex];
    if (Array.isArray(lastA?.suggestions) && lastA.suggestions.length) return;

    const key = String(lastAssistantIndex) + ":" + String(lastA?.content || "").slice(0, 120);
    if (followUpsDoneRef.current.has(key)) return;
    followUpsDoneRef.current.add(key);

    (async () => {
      try {
        const userMessage = pickLastUserText(messages as any);
        const res = await fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flow: "aura",
            userMessage,
            reply: String(lastA?.content || ""),
          }),
        });

        if (!res.ok) return;
        const data = await res.json().catch(() => ({} as any));
        const list = Array.isArray(data?.followUps) ? data.followUps : [];
        if (!list.length) return;

        setMessages((prev: any) => {
          const copy = [...prev];
          const m = copy[lastAssistantIndex];
          if (!m || m.role !== "assistant") return prev;
          if (Array.isArray(m?.suggestions) && m.suggestions.length) return prev;
          copy[lastAssistantIndex] = { ...m, suggestions: list.slice(0, 3) };
          return copy;
        });
      } catch {
        // ignore
      }
    })();
  }, [messages]);

  ${hasActiveThreadId ? `
  useEffect(() => {
    // Auto title, once per thread, derived from first user message
    if (!activeThreadId) return;
    if (titledThreadsRef.current.has(activeThreadId)) return;

    const firstUser = (messages as any).find((m: any) => m?.role === "user" && String(m?.content || "").trim());
    if (!firstUser) return;

    const title = makePremiumTitle(String(firstUser.content || ""));
    titledThreadsRef.current.add(activeThreadId);

    fetch(\`/api/threads/\${activeThreadId}/title\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  }, [activeThreadId, messages]);
  ` : ""}

  /* PREMIUM_VISION_END */
`;

if (match) {
  const insertAt = match.index + match[0].length;
  src = src.slice(0, insertAt) + "\n" + premiumBlock + "\n" + src.slice(insertAt);
} else {
  // fallback, place near top of component, after first useEffect import area
  const idx = src.indexOf("export default function");
  if (idx !== -1) {
    src = src.slice(0, idx) + premiumBlock + "\n" + src.slice(idx);
  }
}

// Update pills list to prefer suggestions if present
src = src.replace(
  /const\\s+list\\s*=\\s*buildVisionPills\\(lastA\\?\\.content\\s*\\|\\|\\s*["']["']\\);/g,
  'const list = Array.isArray((lastA as any)?.suggestions) && (lastA as any).suggestions.length ? (lastA as any).suggestions : buildVisionPills(lastA?.content || "");'
);

src = fs.writeFileSync(visionFile, src, "utf8");
console.log("Patched:", visionFile);
console.log("Backup:", bak);

