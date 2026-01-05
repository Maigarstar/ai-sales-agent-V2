const fs = require("fs");
const path = require("path");

const targets = [
  { name: "ChatUI", file: "src/app/_public/aura-chat/ChatUI.tsx" },
  { name: "VisionWorkspace", file: "src/app/vision/VisionWorkspace.tsx" },
];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(src, begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  return src.replace(re, "");
}

for (const t of targets) {
  const file = path.join(process.cwd(), t.file);
  if (!fs.existsSync(file)) {
    console.log("Skip, not found:", t.file);
    continue;
  }

  let src = fs.readFileSync(file, "utf8");
  const bak = file + ".bak_instant_sidebar_titles";
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

  src = removeBlock(src, "/* THREADS_REFRESH_HELPER_BEGIN */", "/* THREADS_REFRESH_HELPER_END */");
  src = removeBlock(src, "/* THREAD_TITLE_REFRESH_AFTER_SEND_BEGIN */", "/* THREAD_TITLE_REFRESH_AFTER_SEND_END */");

  const hasThreadsState = /const\s*\[\s*threads\s*,\s*setThreads\s*\]\s*=\s*useState/.test(src);
  if (!hasThreadsState) {
    console.log("Skip, no threads state in:", t.file);
    fs.writeFileSync(file, src, "utf8");
    continue;
  }

  const hasActiveThreadId = /const\s*\[\s*activeThreadId\s*,\s*setActiveThreadId\s*\]\s*=\s*useState/.test(src);

  const helper = `
  /* THREADS_REFRESH_HELPER_BEGIN */
  async function refreshThreads(preferId?: string) {
    try {
      const tRes = await fetch("/api/threads", { method: "GET" });
      if (!tRes.ok) return;

      const tData = await tRes.json().catch(() => ({} as any));
      const list = Array.isArray((tData as any)?.threads) ? (tData as any).threads : [];
      setThreads(list);

      ${hasActiveThreadId ? `
      const nextId = String(preferId || "").trim();
      if (nextId && !String(activeThreadId || "").trim()) {
        setActiveThreadId(nextId);
      }
      ` : ``}
    } catch {
      // ignore
    }
  }
  /* THREADS_REFRESH_HELPER_END */
`;

  // insert helper right after threads state line (or after activeThreadId if it exists and appears later)
  const threadsStateRe = /const\s*\[\s*threads\s*,\s*setThreads\s*\]\s*=\s*useState[\s\S]*?;\s*/m;
  const threadsMatch = src.match(threadsStateRe);
  if (!threadsMatch) {
    console.log("Skip, could not locate threads state line in:", t.file);
    fs.writeFileSync(file, src, "utf8");
    continue;
  }
  const insertAt = src.indexOf(threadsMatch[0]) + threadsMatch[0].length;
  src = src.slice(0, insertAt) + helper + src.slice(insertAt);

  // now add the tiny refresh call right after the chat send response json, for the real chat fetch
  const fetchIdx = src.search(/fetch\((["'])\/api\/(chat|vendors-chat)\1/);
  if (fetchIdx === -1) {
    console.log("Skip, no /api/chat or /api/vendors-chat fetch found in:", t.file);
    fs.writeFileSync(file, src, "utf8");
    continue;
  }

  const jsonRe = /const\s+data\s*=\s*await\s+res\.json\(\)[\s;]*/g;
  jsonRe.lastIndex = fetchIdx;

  const jsonMatch = jsonRe.exec(src);
  if (!jsonMatch) {
    console.log("Skip, could not find const data = await res.json() after fetch in:", t.file);
    fs.writeFileSync(file, src, "utf8");
    continue;
  }

  const afterJsonIdx = jsonMatch.index + jsonMatch[0].length;

  const callBlock = `
      /* THREAD_TITLE_REFRESH_AFTER_SEND_BEGIN */
      try {
        const tid =
          String((data as any)?.threadId || "").trim() ${
            hasActiveThreadId ? `|| String(activeThreadId || "").trim()` : ``
          };
        if (tid) void refreshThreads(tid);
        else void refreshThreads();
      } catch {
        // ignore
      }
      /* THREAD_TITLE_REFRESH_AFTER_SEND_END */
`;

  src = src.slice(0, afterJsonIdx) + callBlock + src.slice(afterJsonIdx);

  fs.writeFileSync(file, src, "utf8");
  console.log("Patched:", t.file);
  console.log("Backup:", bak);
}

console.log("Done.");
