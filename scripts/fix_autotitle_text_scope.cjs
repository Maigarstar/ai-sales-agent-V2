const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_autotitle_text_scope";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

/* 1) Remove the broken call block, wherever it is */
src = src.replace(
  /\/\*\s*AUTO_TITLE_SAFE_CALL\s*\*\/[\s\S]*?\/\*\s*AUTO_TITLE_SAFE_CALL_END\s*\*\//g,
  ""
);

/* 2) Ensure helper exists (do NOT add if it already exists) */
const hasHelper = src.includes("async function maybeAutoTitleThread(");
if (!hasHelper) {
  const anchor = 'const [activeThreadId, setActiveThreadId] = useState<string>("");';
  if (!src.includes(anchor)) {
    console.error("activeThreadId state not found, cannot insert helper safely.");
    process.exit(1);
  }

  const helper = `
  /* AUTO_TITLE_SAFE_BEGIN */
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

  async function maybeAutoTitleThread(threadId: string, firstUserText: string) {
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
      const savedTitle = String(data?.thread?.title || title);

      setThreads((prev: any) =>
        Array.isArray(prev)
          ? prev.map((t: any) => (t?.id === id ? { ...t, title: savedTitle } : t))
          : prev
      );
    } catch {
      // ignore
    }
  }
  /* AUTO_TITLE_SAFE_END */
`;
  src = src.replace(anchor, anchor + "\n" + helper);
}

/* 3) Insert the call inside handleSend, right after parsing vendors chat response */
const fetchIdx = src.indexOf('fetch("/api/vendors-chat"');
if (fetchIdx === -1) {
  console.error('Could not find fetch("/api/vendors-chat") in ChatUI.tsx');
  process.exit(1);
}

const jsonIdx =
  src.indexOf("const data = await res.json()", fetchIdx) !== -1
    ? src.indexOf("const data = await res.json()", fetchIdx)
    : src.indexOf("const data = await res.json().catch", fetchIdx);

if (jsonIdx === -1) {
  console.error("Could not find const data = await res.json near vendors chat fetch.");
  process.exit(1);
}

const semi = src.indexOf(";", jsonIdx);
if (semi === -1) {
  console.error("Could not find end of data parse statement.");
  process.exit(1);
}

const call = `
      /* AUTO_TITLE_SAFE_CALL */
      const isFirstUserMessageInThisThread = !messages.some((m) => m.role === "user");
      const threadIdFromResponse = String(data?.threadId || "").trim();
      const effectiveThreadId = String(threadIdFromResponse || activeThreadId || "").trim();

      if (isFirstUserMessageInThisThread && effectiveThreadId) {
        void maybeAutoTitleThread(effectiveThreadId, text);
      }
      /* AUTO_TITLE_SAFE_CALL_END */
`;

src = src.slice(0, semi + 1) + call + src.slice(semi + 1);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed auto title call scope in:", file);
console.log("Backup saved as:", bak);
