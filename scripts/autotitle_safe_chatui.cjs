const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_autotitle_safe";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// Remove any previous auto title helpers if present
src = src.replace(/\/\*\s*AUTO_TITLE_SAFE_BEGIN\s*\*\/[\s\S]*?\/\*\s*AUTO_TITLE_SAFE_END\s*\*\//g, "");

// Ensure threads state exists (only if missing)
if (!src.includes("const [threads, setThreads]")) {
  const insertAfter = 'const [activeThreadId, setActiveThreadId] = useState<string>("");';
  if (!src.includes(insertAfter)) {
    console.error("activeThreadId state not found, cannot patch safely.");
    process.exit(1);
  }
  src = src.replace(
    insertAfter,
    insertAfter + '\n  const [threads, setThreads] = useState<any[]>([]);'
  );
}

// Insert helpers right after activeThreadId state
const stateAnchor = 'const [activeThreadId, setActiveThreadId] = useState<string>("");';
if (!src.includes(stateAnchor)) {
  console.error("activeThreadId state not found, cannot patch safely.");
  process.exit(1);
}

const helperBlock = `
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

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const savedTitle = String(data?.thread?.title || title);

        setThreads((prev: any) =>
          Array.isArray(prev)
            ? prev.map((t: any) => (t?.id === id ? { ...t, title: savedTitle } : t))
            : prev
        );
      }
    } catch {
      // ignore
    }
  }
  /* AUTO_TITLE_SAFE_END */
`;

if (!src.includes("titledThreadIdsRef")) {
  src = src.replace(stateAnchor, stateAnchor + "\n" + helperBlock);
}

// Patch the place where threadId is set from the API response
// Replace single line setActiveThreadId with a block that also titles the thread on first user message
const oneLine = /if\s*\(\s*data\?\.\s*threadId\s*\)\s*setActiveThreadId\s*\(\s*data\.threadId\s*\)\s*;\s*/;

if (oneLine.test(src) && !src.includes("AUTO_TITLE_SAFE_CALL")) {
  src = src.replace(oneLine, (m) => {
    return `
      /* AUTO_TITLE_SAFE_CALL */
      const wasFirstUserMessage = !messages.some((x) => x.role === "user");
      if (data?.threadId) {
        setActiveThreadId(data.threadId);
        if (wasFirstUserMessage) void maybeAutoTitleThread(data.threadId, text);
      }
      /* AUTO_TITLE_SAFE_CALL_END */
    `;
  });
} else if (!src.includes("AUTO_TITLE_SAFE_CALL")) {
  // Fallback, if we cannot find the exact line, we insert a safe call after data parsing
  const dataAnchor = "const data = await res.json()";
  const idx = src.indexOf(dataAnchor);
  if (idx === -1) {
    console.error("Could not find response json parsing, cannot patch safely.");
    process.exit(1);
  }

  const insertPoint = src.indexOf(";", idx);
  if (insertPoint === -1) {
    console.error("Could not locate end of data parse statement.");
    process.exit(1);
  }

  const injection = `
      /* AUTO_TITLE_SAFE_CALL */
      const wasFirstUserMessage = !messages.some((x) => x.role === "user");
      const threadForTitle = (data?.threadId || activeThreadId || "").toString();
      if (wasFirstUserMessage && threadForTitle) {
        void maybeAutoTitleThread(threadForTitle, text);
      }
      /* AUTO_TITLE_SAFE_CALL_END */
`;

  src = src.slice(0, insertPoint + 1) + injection + src.slice(insertPoint + 1);
}

fs.writeFileSync(file, src, "utf8");
console.log("Auto title safe patch applied.");
console.log("Backup saved as:", bak);
