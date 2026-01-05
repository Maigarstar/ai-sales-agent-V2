const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_types";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

function has(s) {
  return src.includes(s);
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceBlock(begin, end, replacement) {
  const re = new RegExp(esc(begin) + "[\\s\\S]*?" + esc(end), "g");
  if (!re.test(src)) return false;
  src = src.replace(re, replacement);
  return true;
}

/* Ensure state and refs exist (safe, no duplicates) */
if (has("const [messages, setMessages]") && !has("followupsDismissed")) {
  src = src.replace(
    /(const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState[\s\S]*?;\s*)/m,
    (m) =>
      m +
      `\n  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(false);\n  const followupsShownRef = useRef<number>(0);\n  const followupsDoneIdsRef = useRef<Set<string>>(new Set());\n`
  );
}

const typedBlock =
`  /* VISION_FOLLOWUPS_BEGIN */
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

  function getUserCount(arr: any[]): number {
    let c = 0;
    for (const m of arr || []) if (m && m.role === "user") c++;
    return c;
  }

  function findLastAssistantIndex(arr: any[]): number {
    for (let i = (arr || []).length - 1; i >= 0; i--) {
      const m = arr[i];
      if (m && m.role === "assistant") return i;
    }
    return -1;
  }

  function findNearestUserBefore(arr: any[], idx: number): string {
    for (let i = idx - 1; i >= 0; i--) {
      const m = arr[i];
      if (m && m.role === "user") return String(m.content || "").trim();
    }
    return "";
  }

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
    if (followupsShownRef.current >= 4) return;

    const arr = Array.isArray(messages) ? (messages as any[]) : [];
    const userCount = getUserCount(arr);
    if (userCount < 2) return;

    const aIdx = findLastAssistantIndex(arr);
    if (aIdx < 0) return;

    const a = arr[aIdx];
    const id = String((a as any)?.id ?? aIdx);

    if (followupsDoneIdsRef.current.has(id)) return;

    const already = Array.isArray((a as any)?.followups) ? (a as any).followups : [];
    if (already.length > 0) return;

    const lastUser = findNearestUserBefore(arr, aIdx);
    const lastAssistant = String((a as any)?.content || "").trim();
    if (!lastUser || !lastAssistant) return;

    followupsDoneIdsRef.current.add(id);

    (async () => {
      const list = await requestFollowups(lastUser, lastAssistant);
      if (!list.length) return;

      setMessages((prev: any) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        for (let i = next.length - 1; i >= 0; i--) {
          const m = next[i];
          const mid = String((m as any)?.id ?? i);
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

  const visionFollowups = useMemo<string[]>(() => {
    const arr = Array.isArray(messages) ? (messages as any[]) : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      const m = arr[i];
      const list = Array.isArray((m as any)?.followups) ? (m as any).followups : [];
      if (m && m.role === "assistant" && list.length) return list.slice(0, 4);
    }
    return [];
  }, [messages]);

  const visionUserCount = useMemo<number>(() => {
    return getUserCount(Array.isArray(messages) ? (messages as any[]) : []);
  }, [messages]);

  const showVisionFollowups = visionUserCount >= 2 && !followupsDismissed && visionFollowups.length > 0;

  function onVisionFollowupClick(t: string): void {
    try {
      setFollowupsDismissed(true);
      // handler was already wired by the earlier patch
      // keep it simple, just call the same behaviour you already have
      // if handleSend exists, it will be used, otherwise it falls back to input
      if (typeof (globalThis as any).handleSend === "function") {
        (globalThis as any).handleSend(t);
      } else {
        setInput(t);
      }
    } catch {
      // ignore
    }
  }
  /* VISION_FOLLOWUPS_END */`;

const ok = replaceBlock("/* VISION_FOLLOWUPS_BEGIN */", "/* VISION_FOLLOWUPS_END */", typedBlock);

if (!ok) {
  console.error("Follow ups block not found in VisionWorkspace, nothing changed.");
  process.exit(1);
}

fs.writeFileSync(file, src, "utf8");
console.log("Fixed types in:", file);
console.log("Backup:", bak);
