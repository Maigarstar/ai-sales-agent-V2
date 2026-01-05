const fs = require("fs");
const path = require("path");

function backup(p, suffix) {
  if (!fs.existsSync(p)) return null;
  const bak = p + suffix;
  if (!fs.existsSync(bak)) fs.copyFileSync(p, bak);
  return bak;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeBlock(src, begin, end) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc(begin) + "[\\s\\S]*?" + esc(end), "g");
  return src.replace(re, "");
}

/* 1) API route: /api/followups */
const routeFile = path.join(process.cwd(), "src/app/api/followups/route.ts");
ensureDir(path.dirname(routeFile));
backup(routeFile, ".bak_vision_followups_route");

fs.writeFileSync(
  routeFile,
  `import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

function safeFallback(lastUser: string) {
  const base = String(lastUser || "").trim();
  const short = base.length > 60 ? base.slice(0, 60) + "…" : base;

  const list = [
    "Show me 3 options and explain why each fits",
    "What would you ask me next to narrow this down",
    "Give me a simple checklist for the next 7 days",
    "What budget range should I expect for this plan",
  ];

  if (short) list[0] = "Give me 3 options for: " + short;
  return list.slice(0, 4);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const lastUser = String(body?.lastUser || "").trim();
    const lastAssistant = String(body?.lastAssistant || "").trim();

    if (!lastUser || !lastAssistant) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON, an array of 3 to 4 short follow up questions. No numbering, no bullets, no extra text.",
        },
        {
          role: "user",
          content: [
            "Last user message:",
            lastUser,
            "",
            "Assistant reply:",
            lastAssistant,
            "",
            "Return a JSON array like:",
            '["Question 1","Question 2","Question 3"]',
          ].join("\\n"),
        },
      ],
    });

    const raw = String(completion.choices?.[0]?.message?.content || "").trim();

    let arr = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      arr = [];
    }

    const followups = (arr || [])
      .filter((x) => typeof x === "string")
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 4);

    if (followups.length === 0) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    return NextResponse.json({ ok: true, followups }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: true, followups: safeFallback("") },
      { status: 200 }
    );
  }
}
`,
  "utf8"
);

console.log("Created or updated:", routeFile);

/* 2) Patch VisionWorkspace only */
const visionFile = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(visionFile)) {
  console.error("VisionWorkspace.tsx not found:", visionFile);
  process.exit(1);
}

backup(visionFile, ".bak_vision_followups");

let src = fs.readFileSync(visionFile, "utf8");
src = removeBlock(src, "/* VISION_FOLLOWUPS_BEGIN */", "/* VISION_FOLLOWUPS_END */");

/* Add followups to Message type if present */
if (src.includes("type Message = {") && !src.includes("followups?:")) {
  src = src.replace(
    /type Message = \{([\s\S]*?)\};/m,
    (m) => {
      if (m.includes("followups?:")) return m;
      return m.replace(/\};\s*$/m, `  followups?: string[];\n};`);
    }
  );
}

/* Detect send function name for chips */
const hasHandleSend = src.includes("function handleSend") || src.includes("async function handleSend");
const hasSendMessage = src.includes("function sendMessage") || src.includes("async function sendMessage");

let chipAction = `setInput(t);`;
if (hasHandleSend) chipAction = `handleSend(t);`;
else if (hasSendMessage) chipAction = `sendMessage(t);`;

const wsStart = src.indexOf("export default function VisionWorkspace");
if (wsStart === -1) {
  console.error("VisionWorkspace export not found, patch stopped.");
  process.exit(1);
}

const braceOpen = src.indexOf("{", wsStart);
if (braceOpen === -1) {
  console.error("VisionWorkspace opening brace not found, patch stopped.");
  process.exit(1);
}

const returnIdx = src.indexOf("return (", braceOpen);
if (returnIdx === -1) {
  console.error("VisionWorkspace return not found, patch stopped.");
  process.exit(1);
}

let pre = src.slice(0, returnIdx);
let post = src.slice(returnIdx);

/* Insert state lines after messages state if possible */
if (pre.includes("const [messages, setMessages]") && !pre.includes("followupsDismissed")) {
  pre = pre.replace(
    /(const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState[\s\S]*?;\s*)/m,
    (m) =>
      m +
      `\n  const [followupsDismissed, setFollowupsDismissed] = useState(false);\n  const followupsShownRef = useRef(0);\n  const followupsDoneIdsRef = useRef(new Set());\n`
  );
}

/* Insert helper block before return */
if (!pre.includes("VISION_FOLLOWUPS_BEGIN")) {
  pre += `
  /* VISION_FOLLOWUPS_BEGIN */
  async function requestFollowups(lastUser, lastAssistant) {
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastUser, lastAssistant }),
      });
      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.followups) ? data.followups : [];
      return list.filter((x) => typeof x === "string").map((s) => String(s).trim()).filter(Boolean).slice(0, 4);
    } catch {
      return [];
    }
  }

  function getUserCount(arr) {
    let c = 0;
    for (const m of arr || []) if (m && m.role === "user") c++;
    return c;
  }

  function findLastAssistantIndex(arr) {
    for (let i = (arr || []).length - 1; i >= 0; i--) {
      const m = arr[i];
      if (m && m.role === "assistant") return i;
    }
    return -1;
  }

  function findNearestUserBefore(arr, idx) {
    for (let i = idx - 1; i >= 0; i--) {
      const m = arr[i];
      if (m && m.role === "user") return String(m.content || "").trim();
    }
    return "";
  }

  useEffect(() => {
    const onDown = (e) => {
      const el = e && e.target;
      if (el && typeof el.closest === "function" && el.closest('[data-vision-followups="1"]')) return;
      setFollowupsDismissed(true);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    if (followupsShownRef.current >= 4) return;

    const arr = Array.isArray(messages) ? messages : [];
    const userCount = getUserCount(arr);
    if (userCount < 2) return;

    const aIdx = findLastAssistantIndex(arr);
    if (aIdx < 0) return;

    const a = arr[aIdx];
    const id = String(a?.id || aIdx);

    if (followupsDoneIdsRef.current.has(id)) return;

    const already = Array.isArray(a?.followups) ? a.followups : [];
    if (already.length > 0) return;

    const lastUser = findNearestUserBefore(arr, aIdx);
    const lastAssistant = String(a?.content || "").trim();
    if (!lastUser || !lastAssistant) return;

    followupsDoneIdsRef.current.add(id);

    (async () => {
      const list = await requestFollowups(lastUser, lastAssistant);
      if (!list.length) return;

      setMessages((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        for (let i = next.length - 1; i >= 0; i--) {
          const m = next[i];
          const mid = String(m?.id || i);
          if (m && m.role === "assistant" && mid === id) {
            next[i] = { ...m, followups: list };
            break;
          }
        }
        return next;
      });

      setFollowupsDismissed(false);
      followupsShownRef.current += 1;

      if (followupsShownRef.current >= 4) {
        setTimeout(() => setFollowupsDismissed(true), 1200);
      }
    })();
  }, [messages]);

  const visionFollowups = useMemo(() => {
    const arr = Array.isArray(messages) ? messages : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      const m = arr[i];
      const list = Array.isArray(m?.followups) ? m.followups : [];
      if (m && m.role === "assistant" && list.length) return list.slice(0, 4);
    }
    return [];
  }, [messages]);

  const visionUserCount = useMemo(() => {
    return getUserCount(Array.isArray(messages) ? messages : []);
  }, [messages]);

  const showVisionFollowups = visionUserCount >= 2 && !followupsDismissed && visionFollowups.length > 0;

  function onVisionFollowupClick(t) {
    try {
      setFollowupsDismissed(true);
      ${chipAction}
    } catch {
      // ignore
    }
  }
  /* VISION_FOLLOWUPS_END */
`;
}

/* Insert render block near pills anchor */
const anchor = "{/* VISION_PILLS_RENDER */}";
if (post.includes(anchor) && !post.includes("VISION_FOLLOWUPS_RENDER")) {
  post = post.replace(
    anchor,
    `{/* VISION_FOLLOWUPS_RENDER */}
              {showVisionFollowups ? (
                <div data-vision-followups="1" className="mb-3 flex flex-wrap gap-2">
                  {visionFollowups.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onVisionFollowupClick(t)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}

              ${anchor}`
  );
}

src = pre + post;
fs.writeFileSync(visionFile, src, "utf8");

console.log("Patched:", visionFile);
console.log("Backups created: .bak_vision_followups_route and .bak_vision_followups");
