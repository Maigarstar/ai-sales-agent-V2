const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_duplicate_refreshThreads";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  src = src.replace(re, "");
}

// 1) remove the helper we injected
removeBlock("/* THREADS_REFRESH_HELPER_BEGIN */", "/* THREADS_REFRESH_HELPER_END */");

// 2) check if refreshThreads already exists (function or const)
const hasRefreshThreads =
  /\basync\s+function\s+refreshThreads\b/.test(src) ||
  /\bfunction\s+refreshThreads\b/.test(src) ||
  /\bconst\s+refreshThreads\b/.test(src);

// 3) if it does not exist, re add a single helper near threads state
if (!hasRefreshThreads) {
  const threadsStateRe = /const\s*\[\s*threads\s*,\s*setThreads\s*\]\s*=\s*useState[\s\S]*?;\s*/m;
  const match = src.match(threadsStateRe);

  if (!match) {
    console.error("Could not find threads state to attach helper. No changes written.");
    process.exit(1);
  }

  const insertAt = src.indexOf(match[0]) + match[0].length;

  const block = `
  /* THREADS_REFRESH_HELPER_BEGIN */
  async function refreshThreads(preferId?: string) {
    try {
      const tRes = await fetch("/api/threads", { method: "GET" });
      if (!tRes.ok) return;

      const tData = await tRes.json().catch(() => ({} as any));
      const list = Array.isArray((tData as any)?.threads) ? (tData as any).threads : [];
      setThreads(list);

      if (preferId && typeof setActiveThreadId === "function") {
        try {
          if (!String((activeThreadId as any) || "").trim()) setActiveThreadId(String(preferId));
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }
  /* THREADS_REFRESH_HELPER_END */
`;

  src = src.slice(0, insertAt) + block + src.slice(insertAt);
}

fs.writeFileSync(file, src, "utf8");
console.log("Fixed duplicate refreshThreads in:", file);
console.log("Backup:", bak);
