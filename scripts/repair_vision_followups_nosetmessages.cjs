const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_nosetmessages";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const BEGIN = "/* VISION_FOLLOWUPS_BEGIN */";
const END = "/* VISION_FOLLOWUPS_END */";
const RENDER_MARK = "{/* VISION_FOLLOWUPS_RENDER */}";

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (!src.includes(BEGIN) || !src.includes(END)) {
  console.error("Follow ups markers not found, stopping to avoid guessing.");
  process.exit(1);
}

/* Replace follow ups logic block with a build safe version that does NOT use setMessages */
const newBlock = `  ${BEGIN}
  type VisionFollowupMsg = { role: "user" | "assistant"; content: string };

  const [visionFollowupsState, setVisionFollowupsState] = useState<string[]>([]);
  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(true);

  const followupsKeyDoneRef = useRef<Set<string>>(new Set());

  const visionUserCount = useMemo(() => {
    const arr = Array.isArray(messages) ? (messages as any as VisionFollowupMsg[]) : [];
    let c = 0;
    for (const m of arr) if (m?.role === "user") c += 1;
    return c;
  }, [messages]);

  const visionLastAssistantIndex = useMemo(() => {
    const arr = Array.isArray(messages) ? (messages as any as VisionFollowupMsg[]) : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const visionLastUserText = useMemo(() => {
    const arr = Array.isArray(messages) ? (messages as any as VisionFollowupMsg[]) : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.role === "user") return String(arr[i]?.content || "").trim();
    }
    return "";
  }, [messages]);

  const visionLastAssistantText = useMemo(() => {
    const arr = Array.isArray(messages) ? (messages as any as VisionFollowupMsg[]) : [];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.role === "assistant") return String(arr[i]?.content || "").trim();
    }
    return "";
  }, [messages]);

  const visionLastAssistantKey = useMemo(() => {
    if (visionLastAssistantIndex < 0) return "";
    const arr = Array.isArray(messages) ? (messages as any as VisionFollowupMsg[]) : [];
    const a = arr[visionLastAssistantIndex];
    const head = String(a?.content || "").slice(0, 64);
    return String(visionLastAssistantIndex) + ":" + head;
  }, [messages, visionLastAssistantIndex]);

  async function requestVisionFollowups(lastUser: string, lastAssistant: string): Promise<string[]> {
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

  const showVisionFollowups =
    visionUserCount >= 2 &&
    !followupsDismissed &&
    Array.isArray(visionFollowupsState) &&
    visionFollowupsState.length > 0 &&
    visionLastAssistantIndex >= 0;

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
  }, [showVisionFollowups, visionLastAssistantKey]);

  useEffect(() => {
    if (visionUserCount < 2) return;
    if (!visionLastAssistantKey) return;
    if (!visionLastUserText || !visionLastAssistantText) return;

    if (followupsKeyDoneRef.current.has(visionLastAssistantKey)) return;
    followupsKeyDoneRef.current.add(visionLastAssistantKey);

    (async () => {
      const list = await requestVisionFollowups(visionLastUserText, visionLastAssistantText);
      if (!list.length) return;
      setVisionFollowupsState(list.slice(0, 4));
      setFollowupsDismissed(false);
    })();
  }, [visionUserCount, visionLastAssistantKey, visionLastUserText, visionLastAssistantText]);

  function onVisionFollowupClick(t: string): void {
    setFollowupsDismissed(true);
    try {
      setInput(String(t || ""));
    } catch {
      // ignore
    }
  }
  ${END}`;

/* Replace block */
const blockRe = new RegExp(esc(BEGIN) + "[\\s\\S]*?" + esc(END), "g");
src = src.replace(blockRe, newBlock);

/* Ensure render marker actually renders chips */
if (src.includes(RENDER_MARK)) {
  const render = `${RENDER_MARK}
                    {m.role === "assistant" && i === visionLastAssistantIndex && showVisionFollowups ? (
                      <div data-vision-followups="1" className="mt-3 flex flex-wrap gap-2">
                        {visionFollowupsState.slice(0, 4).map((t, k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => onVisionFollowupClick(t)}
                            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-700"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : null}`;
  src = src.replace(RENDER_MARK, render);
}

fs.writeFileSync(file, src, "utf8");
console.log("Repaired Vision follow ups without setMessages.");
console.log("File:", file);
console.log("Backup:", bak);
