const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function backup(file) {
  if (!fs.existsSync(file)) return;
  const bak = file + ".bak_autotitle";
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  backup(file);
  fs.writeFileSync(file, content, "utf8");
}

const routeFile = path.join(process.cwd(), "src/app/api/threads/[id]/route.ts");
const chatUIFile = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");

/* ---------------------------
   1) Add PATCH route for title update
---------------------------- */
const routeSrc = `import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const title = String(body?.title || "").trim();

    if (!id || !title) {
      return NextResponse.json({ ok: false, error: "Missing id or title" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("threads")
      .update({ title })
      .eq("id", id)
      .select("id,title,chat_type,created_at,updated_at")
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

/* ---------------------------
   2) Patch ChatUI.tsx
---------------------------- */
if (!fs.existsSync(chatUIFile)) {
  console.error("ChatUI.tsx not found at:", chatUIFile);
  process.exit(1);
}

let src = fs.readFileSync(chatUIFile, "utf8");
backup(chatUIFile);

const helperMarker = "/* AUTO_THREAD_TITLE_BEGIN */";
const callMarker = "/* AUTO_THREAD_TITLE_CALL */";

const anchor = "  /* Bootstrap, prefer server threads, else fall back to local storage */";

if (!src.includes(anchor)) {
  console.error("Anchor not found in ChatUI.tsx, cannot patch safely.");
  process.exit(1);
}

if (!src.includes(helperMarker)) {
  const helperBlock = `
  /* AUTO_THREAD_TITLE_BEGIN */
  function makeThreadTitleFromText(text: string) {
    const clean = String(text || "")
      .replace(/\\s+/g, " ")
      .replace(/[“”"]/g, "")
      .trim();

    if (!clean) return "Conversation";

    const max = 56;
    if (clean.length <= max) return clean;

    return clean.slice(0, max).trim() + "…";
  }

  async function setThreadTitle(threadId: string, title: string) {
    const id = String(threadId || "").trim();
    const t = String(title || "").trim();
    if (!id || !t) return;

    try {
      const res = await fetch(\`/api/threads/\${id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });

      if (!res.ok) return;

      const data = await res.json().catch(() => ({}));
      const updatedTitle = String(data?.thread?.title || t);

      setThreads((prev) =>
        Array.isArray(prev)
          ? prev.map((x: any) => (x?.id === id ? { ...x, title: updatedTitle } : x))
          : prev
      );
    } catch {
      // ignore
    }
  }
  /* AUTO_THREAD_TITLE_END */
`;
  src = src.replace(anchor, helperBlock + "\n" + anchor);
}

if (!src.includes(callMarker)) {
  const target = "    if (!text) return;\n";
  if (!src.includes(target)) {
    console.error("Target line not found in handleSend, cannot patch safely.");
    process.exit(1);
  }

  const callBlock = `
    /* AUTO_THREAD_TITLE_CALL */
    if (serverMode && activeThreadId) {
      const hadUserBefore = messages.some((m) => m.role === "user");
      if (!hadUserBefore) {
        const title = makeThreadTitleFromText(text);
        void setThreadTitle(activeThreadId, title);
      }
    }
    /* AUTO_THREAD_TITLE_CALL_END */

`;
  src = src.replace(target, target + callBlock);
}

fs.writeFileSync(chatUIFile, src, "utf8");

console.log("Done.");
console.log("Added route:", routeFile);
console.log("Patched UI:", chatUIFile);
console.log("Backups end with .bak_autotitle");
