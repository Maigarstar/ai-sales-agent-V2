const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function backup(file, suffix) {
  if (!fs.existsSync(file)) return;
  const bak = file + suffix;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  backup(file, ".bak_autotitle_v2");
  fs.writeFileSync(file, content, "utf8");
}

/* =========================
   1) API route, PATCH thread title
   ========================= */
const routeFile = path.join(process.cwd(), "src/app/api/threads/[id]/route.ts");

const routeSrc = `import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const raw = String(body?.title || "").trim();
    const title = raw.slice(0, 80);

    if (!id || !title) {
      return NextResponse.json({ ok: false, error: "Missing id or title" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("threads")
      .update({ title })
      .eq("id", id)
      .select("id,title,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, thread: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
`;

writeFile(routeFile, routeSrc);

/* =========================
   2) Patch ChatUI, clean insert, no conversationId changes
   ========================= */
const chatUIFile = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(chatUIFile)) {
  console.error("ChatUI.tsx not found at:", chatUIFile);
  process.exit(1);
}

let src = fs.readFileSync(chatUIFile, "utf8");
backup(chatUIFile, ".bak_autotitle_v2");

/* Remove any older title blocks to prevent redeclare issues */
const stripBlocks = [
  /\/\*\s*AUTO_THREAD_TITLE_BEGIN\s*\*\/[\s\S]*?\/\*\s*AUTO_THREAD_TITLE_END\s*\*\//g,
  /\/\*\s*AUTO_THREAD_TITLE_CALL\s*\*\/[\s\S]*?\/\*\s*AUTO_THREAD_TITLE_CALL_END\s*\*\//g,
  /\/\*\s*AUTO_TITLE_V2_BEGIN\s*\*\/[\s\S]*?\/\*\s*AUTO_TITLE_V2_END\s*\*\//g,
  /\/\*\s*AUTO_TITLE_V2_CALL_BEGIN\s*\*\/[\s\S]*?\/\*\s*AUTO_TITLE_V2_CALL_END\s*\*\//g,
];
stripBlocks.forEach((re) => {
  src = src.replace(re, "");
});

/* Remove any leftover shouldAutoTitle blocks safely */
src = src.replace(
  /^[ \t]*const shouldAutoTitle[^\n]*\n[\s\S]*?(?=^[ \t]*const id = await startConversationIfNeeded\(\);\s*$)/gm,
  ""
);

/* Insert helper after activeThreadId state */
const stateAnchor = 'const [activeThreadId, setActiveThreadId] = useState<string>("");';

if (!src.includes(stateAnchor)) {
  console.error("Could not find activeThreadId state line, patch stopped to avoid damage.");
  process.exit(1);
}

const helper = `
  /* AUTO_TITLE_V2_BEGIN */
  const titledThreadIdsRef = useRef<Set<string>>(new Set());

  function makeThreadTitleFromText(text: string) {
    const clean = String(text || "")
      .replace(/\\s+/g, " ")
      .replace(/[\\\`"'“”]/g, "")
      .trim();

    if (!clean) return "Conversation";

    const max = 64;
    return clean.length <= max ? clean : clean.slice(0, max).trim() + "…";
  }

  async function applyThreadTitleOnce(threadId: string, firstUserText: string) {
    const id = String(threadId || "").trim();
    if (!id) return;

    if (titledThreadIdsRef.current.has(id)) return;
    titledThreadIdsRef.current.add(id);

    const title = makeThreadTitleFromText(firstUserText);

    try {
      const res = await fetch(\`/api/threads/\${id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) return;

      const data = await res.json().catch(() => ({}));
      const updatedTitle = String(data?.thread?.title || title);

      setThreads((prev: any) =>
        Array.isArray(prev)
          ? prev.map((t: any) => (t?.id === id ? { ...t, title: updatedTitle } : t))
          : prev
      );
    } catch {
      // ignore
    }
  }
  /* AUTO_TITLE_V2_END */
`;

src = src.replace(stateAnchor, stateAnchor + "\n" + helper);

/* Insert call right before the vendors chat fetch */
const fetchAnchor = 'const res = await fetch("/api/vendors-chat",';
if (!src.includes(fetchAnchor)) {
  console.error('Could not find fetch("/api/vendors-chat") in ChatUI.tsx, patch stopped.');
  process.exit(1);
}

const call = `
      /* AUTO_TITLE_V2_CALL_BEGIN */
      const isFirstUserMessageInThisThread = !messages.some((m) => m.role === "user");
      const threadIdForTitle = activeThreadId;

      if (isFirstUserMessageInThisThread && threadIdForTitle) {
        void applyThreadTitleOnce(threadIdForTitle, text);
      }
      /* AUTO_TITLE_V2_CALL_END */

`;

src = src.replace(fetchAnchor, call + fetchAnchor);

fs.writeFileSync(chatUIFile, src, "utf8");

console.log("Patched ok");
console.log("Route:", routeFile);
console.log("UI:", chatUIFile);
console.log("Backups: .bak_autotitle_v2");
