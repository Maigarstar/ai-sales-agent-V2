const fs = require("fs");
const path = require("path");

function backup(p, suffix) {
  const bak = p + suffix;
  if (!fs.existsSync(bak)) fs.copyFileSync(p, bak);
  return bak;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

/* ---------- 1) Create API route: /api/threads/search ---------- */
const routeFile = path.join(process.cwd(), "src/app/api/threads/search/route.ts");
ensureDir(path.dirname(routeFile));
backup(routeFile, ".bak_thread_search_route");
fs.writeFileSync(
  routeFile,
  `import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const url = new URL(req.url);
    const qRaw = (url.searchParams.get("q") || "").trim();
    const chatType = (url.searchParams.get("chatType") || "").trim();

    if (!qRaw) {
      return NextResponse.json({ ok: true, threads: [] }, { status: 200 });
    }

    const q = \`%\${qRaw}%\`;

    let threadsByTitle = supabase
      .from("threads")
      .select("id,title,chat_type,created_at,updated_at")
      .ilike("title", q)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (chatType) threadsByTitle = threadsByTitle.eq("chat_type", chatType);

    const titleRes = await threadsByTitle;

    if (titleRes.error) {
      return NextResponse.json({ ok: false, error: titleRes.error.message }, { status: 500 });
    }

    const msgRes = await supabase
      .from("messages")
      .select("thread_id")
      .ilike("content", q)
      .order("created_at", { ascending: false })
      .limit(200);

    if (msgRes.error) {
      return NextResponse.json({ ok: false, error: msgRes.error.message }, { status: 500 });
    }

    const idSet = new Set();

    for (const t of titleRes.data || []) idSet.add(String(t.id));
    for (const m of msgRes.data || []) if (m?.thread_id) idSet.add(String(m.thread_id));

    const ids = Array.from(idSet).slice(0, 50);

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, threads: [] }, { status: 200 });
    }

    let finalQ = supabase
      .from("threads")
      .select("id,title,chat_type,created_at,updated_at")
      .in("id", ids)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (chatType) finalQ = finalQ.eq("chat_type", chatType);

    const finalRes = await finalQ;

    if (finalRes.error) {
      return NextResponse.json({ ok: false, error: finalRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, threads: finalRes.data || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e && e.message) || "search_failed" },
      { status: 500 }
    );
  }
}
`,
  "utf8"
);

console.log("Created or updated:", routeFile);

/* ---------- 2) Patch Vision sidebar search to use server search ---------- */
const visionFile = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(visionFile)) {
  console.error("VisionWorkspace not found:", visionFile);
  process.exit(1);
}
backup(visionFile, ".bak_thread_search_vision");

let src = fs.readFileSync(visionFile, "utf8");

function removeBlock(begin, end) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc(begin) + "[\\s\\S]*?" + esc(end), "g");
  src = src.replace(re, "");
}

removeBlock("/* THREAD_SERVER_SEARCH_BEGIN */", "/* THREAD_SERVER_SEARCH_END */");

const fnIdx = src.indexOf("export default function VisionWorkspace");
if (fnIdx === -1) {
  console.error("VisionWorkspace function not found, patch stopped.");
  process.exit(1);
}

const braceIdx = src.indexOf("{", fnIdx);
if (braceIdx === -1) {
  console.error("VisionWorkspace opening brace not found, patch stopped.");
  process.exit(1);
}

const afterFn = src.slice(braceIdx + 1);
const firstUseEffectRel = afterFn.indexOf("useEffect(");
const firstReturnRel = afterFn.indexOf("return (");

let insertRel = -1;
if (firstUseEffectRel !== -1) insertRel = firstUseEffectRel;
else if (firstReturnRel !== -1) insertRel = firstReturnRel;
else insertRel = afterFn.length;

const insertAbs = braceIdx + 1 + insertRel;

const hasSetThreads = src.includes("setThreads(");
if (!hasSetThreads) {
  console.error("setThreads not found in VisionWorkspace, patch stopped to avoid breaking your UI.");
  process.exit(1);
}

let queryVar = null;
let setQueryVar = null;

if (src.includes("[sessionQuery, setSessionQuery]")) {
  queryVar = "sessionQuery";
  setQueryVar = "setSessionQuery";
} else if (src.includes("[threadQuery, setThreadQuery]")) {
  queryVar = "threadQuery";
  setQueryVar = "setThreadQuery";
} else {
  const stateLine = `\n  const [threadQuery, setThreadQuery] = React.useState<string>("");\n`;
  if (!src.includes("React.useState")) {
    // Most files use useState directly, so add that version instead
    const stateLine2 = `\n  const [threadQuery, setThreadQuery] = useState<string>("");\n`;
    src = src.slice(0, insertAbs) + stateLine2 + src.slice(insertAbs);
  } else {
    src = src.slice(0, insertAbs) + stateLine + src.slice(insertAbs);
  }
  queryVar = "threadQuery";
  setQueryVar = "setThreadQuery";
}

const block = `
  /* THREAD_SERVER_SEARCH_BEGIN */
  useEffect(() => {
    const q = String(${queryVar} || "").trim();
    const controller = new AbortController();

    const t = setTimeout(async () => {
      try {
        const url = q
          ? \`/api/threads/search?q=\${encodeURIComponent(q)}\`
          : "/api/threads";

        const res = await fetch(url, { method: "GET", signal: controller.signal });
        if (!res.ok) return;

        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.threads) ? data.threads : [];
        setThreads(list);
      } catch {
        // ignore
      }
    }, 220);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [${queryVar}]);
  /* THREAD_SERVER_SEARCH_END */
`;

src = src.slice(0, insertAbs) + block + src.slice(insertAbs);

fs.writeFileSync(visionFile, src, "utf8");
console.log("Patched:", visionFile);
console.log("Search state used:", queryVar, "setter:", setQueryVar);
console.log("Backups created with .bak_thread_search_route and .bak_thread_search_vision");
