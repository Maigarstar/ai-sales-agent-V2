const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_repair";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const BEGIN = "/* VISION_FOLLOWUPS_BEGIN */";
const END = "/* VISION_FOLLOWUPS_END */";

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupeLine(re) {
  const matches = [...src.matchAll(re)];
  if (matches.length <= 1) return;
  for (let i = matches.length - 1; i >= 1; i--) {
    const m = matches[i];
    src = src.slice(0, m.index) + src.slice(m.index + m[0].length);
  }
}

if (!src.includes(BEGIN) || !src.includes(END)) {
  console.error("Followups markers not found, stopping to avoid guessing.");
  process.exit(1);
}

/* Ensure followups state exists inside VisionWorkspace scope, exactly once */
dedupeLine(/^\s*const\s*\[\s*followupsDismissed\s*,\s*setFollowupsDismissed\s*\]\s*=\s*useState[^;]*;\s*$/gm);
dedupeLine(/^\s*const\s+followupsDoneIdsRef\s*=\s*useRef[^;]*;\s*$/gm);

if (!src.match(/const\s*\[\s*followupsDismissed\s*,\s*setFollowupsDismissed\s*\]/)) {
  const reMessages = /const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState[^;]*;\s*/m;
  if (reMessages.test(src)) {
    src = src.replace(reMessages, (m) =>
      m +
      `\n  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(true);\n` +
      `  const followupsDoneIdsRef = useRef<Set<string>>(new Set());\n`
    );
  } else {
    const wsIdx = src.indexOf("export default function VisionWorkspace");
    const braceIdx = src.indexOf("{", wsIdx);
    if (braceIdx === -1) {
      console.error("Could not find VisionWorkspace opening brace.");
      process.exit(1);
    }
    src =
      src.slice(0, braceIdx + 1) +
      `\n  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(true);\n` +
      `  const followupsDoneIdsRef = useRef<Set<string>>(new Set());\n` +
      src.slice(braceIdx + 1);
  }
}

/* Replace the entire followups block with a clean, typed, build safe version */
const newBlock =
`  ${BEGIN}
  type VisionMsg = {
    role: "user" | "assistant";
    content: string;
    id?: string;
    followups?: string[];
  };

  async function requestFollowups(lastUser: string, lastAssistant: string): Promise<string[]> {
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastUser, lastAssistant }),
      });
      if (!res.ok) return [];
      const data = await res.json().catch(() => ({} as any));
      const list = Array.isArray((data as any)?.followups) ? (data as any).followups : [];
      return list
        .filter((x: any) => typeof x === "string")
        .map((s: any) => String(s).trim())
        .filter(Boolean)
        .slice(0, 4);
    } catch {
      return [];
    }
  }

  const visionUserCount = useMemo<number>(() => {
    const arr = Array.isArray(messages) ? (messages as VisionMsg[]) : [];
    let c = 0;
    for (const m of arr) if (m?.role === "user") c += 1;
    return c;
  }, [messages]);

  const lastAssistantIndex = useMemo<number>(() => {
    const arr = Array.isArray(messages) ? (messages as VisionMsg[]) : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const visionFollowups = useMemo<string[]>(() => {
    const arr = Array.isArray(messages) ? (messages as VisionMsg[]) : [];
    if (lastAssistantIndex < 0) return [];
    const a = arr[lastAssistantIndex];
    const list = Array.isArray(a?.followups) ? a!.followups! : [];
    return list.slice(0, 4);
  }, [messages, lastAssistantIndex]);

  const showVisionFollowups =
    visionUserCount >= 2 && !followupsDismissed && visionFollowups.length > 0;

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && typeof (el as any).closest === "function" && (el as any).closest('[data-vision-followups="1"]')) return;
      setFollowupsDismissed(true);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    if (!showVisionFollowups) return;
    const t = setTimeout(() => setFollowupsDismissed(true), 9000);
    return () => clearTimeout(t);
  }, [showVisionFollowups, lastAssistantIndex]);

  useEffect(() => {
    if (visionUserCount < 2) return;
    if (lastAssistantIndex < 0) return;

    const arr = Array.isArray(messages) ? (messages as VisionMsg[]) : [];
    const a = arr[lastAssistantIndex];
    const aKey = String(a?.id ?? lastAssistantIndex);

    if (Array.isArray(a?.followups) && a!.followups!.length > 0) return;
    if (followupsDoneIdsRef.current.has(aKey)) return;

    let lastUser = "";
    for (let i = lastAssistantIndex - 1; i >= 0; i--) {
      const m = arr[i];
      if (m?.role === "user") {
        lastUser = String(m.content || "").trim();
        break;
      }
    }

    const lastAssistant = String(a?.content || "").trim();
    if (!lastUser || !lastAssistant) return;

    followupsDoneIdsRef.current.add(aKey);

    (async () => {
      const list = await requestFollowups(lastUser, lastAssistant);
      if (!list.length) return;

      setMessages((prev: any) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const idx = next.length - 1 - [...next].reverse().findIndex((m: any) => m?.role === "assistant");
        if (idx >= 0 && next[idx]?.role === "assistant") {
          next[idx] = { ...next[idx], followups: list };
        }
        return next;
      });

      setFollowupsDismissed(false);
    })();
  }, [visionUserCount, lastAssistantIndex]);

  function onVisionFollowupClick(t: string): void {
    setFollowupsDismissed(true);
    try {
      setInput(t);
    } catch {
      // ignore
    }
  }
  ${END}`;

const reBlock = new RegExp(esc(BEGIN) + "[\\s\\S]*?" + esc(END), "g");
src = src.replace(reBlock, newBlock);

fs.writeFileSync(file, src, "utf8");
console.log("Repaired followups block:", file);
console.log("Backup:", bak);
