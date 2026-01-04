const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue;
      walk(p, out);
    } else if (p.endsWith(".ts") || p.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function backup(p) {
  const b = p + ".bak_persistence";
  if (!fs.existsSync(b)) fs.copyFileSync(p, b);
}

function ensureReactImportHasHooks(src) {
  const re1 = /import\s+React\s*,\s*\{([^}]+)\}\s+from\s+["']react["'];/;
  const re2 = /import\s+\{([^}]+)\}\s+from\s+["']react["'];/;

  const addHook = (list, hook) => {
    const items = list
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.includes(hook)) items.push(hook);
    return items.join(", ");
  };

  if (re1.test(src)) {
    return src.replace(re1, (m, inner) => {
      const next = addHook(addHook(inner, "useEffect"), "useState");
      return `import React, { ${next} } from "react";`;
    });
  }

  if (re2.test(src)) {
    return src.replace(re2, (m, inner) => {
      const next = addHook(addHook(inner, "useEffect"), "useState");
      return `import { ${next} } from "react";`;
    });
  }

  return src;
}

function ensureActiveThreadState(src) {
  if (src.includes("activeThreadId") && src.includes("setActiveThreadId")) return src;
  if (!src.includes("useState")) return src;

  const marker = 'const [activeThreadId, setActiveThreadId] = useState<string>("");';
  const lines = src.split("\n");

  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("useState(") || lines[i].includes("useState<")) insertAt = i;
  }
  if (insertAt === -1) return src;

  lines.splice(insertAt + 1, 0, "  " + marker);
  return lines.join("\n");
}

function ensureMountLoader(src) {
  if (src.includes("PERSISTENCE_SETUP_BEGIN")) return src;
  if (!src.includes("setMessages")) return src;

  const block =
`\n  /* PERSISTENCE_SETUP_BEGIN */
  useEffect(() => {
    (async () => {
      try {
        const tRes = await fetch("/api/threads", { method: "GET" });
        if (!tRes.ok) return;

        const tData = await tRes.json().catch(() => ({}));
        const list = Array.isArray(tData?.threads) ? tData.threads : [];
        const firstId = list?.[0]?.id;

        if (!firstId) return;

        setActiveThreadId(firstId);

        const mRes = await fetch(\`/api/threads/\${firstId}/messages\`, { method: "GET" });
        if (!mRes.ok) return;

        const mData = await mRes.json().catch(() => ({}));
        const msgs = Array.isArray(mData?.messages) ? mData.messages : [];

        setMessages(
          msgs.map((m) => ({
            role: m.role,
            content: m.content,
            listings: [],
            meta: m.meta,
          }))
        );
      } catch {
        // ignore
      }
    })();
  }, []);
  /* PERSISTENCE_SETUP_END */\n`;

  const idx = src.indexOf("return (") >= 0 ? src.indexOf("return (") : src.indexOf("return(");
  if (idx === -1) return src;

  return src.slice(0, idx) + block + src.slice(idx);
}

function ensureChatFetchSendsThreadId(src) {
  if (!src.includes("/api/chat") || !src.includes("fetch(")) return src;
  if (src.includes("threadId: activeThreadId")) return src;

  const re = /body:\s*JSON\.stringify\s*\(\s*\{([\s\S]*?)\}\s*\)/m;
  if (!re.test(src)) return src;

  return src.replace(re, (m, inner) => {
    if (inner.includes("threadId")) return m;
    const trimmed = inner.trim();
    const add = trimmed
      ? `${trimmed},\n          threadId: activeThreadId,\n        `
      : `\n          threadId: activeThreadId,\n        `;
    return `body: JSON.stringify({\n        ${add}})`;
  });
}

function ensureThreadIdStoredFromResponse(src) {
  if (src.includes("setActiveThreadId(data.threadId)")) return src;

  const re = /const\s+data\s*=\s*await\s+res\.json\(\)[^\n]*\n?/m;
  if (!re.test(src)) return src;

  return src.replace(re, (m) => {
    if (m.includes("setActiveThreadId(data.threadId)")) return m;
    return m + `\n      if (data?.threadId) setActiveThreadId(data.threadId);\n`;
  });
}

function patchFile(filePath) {
  const isApiRoute =
    filePath.includes(`${path.sep}api${path.sep}`) &&
    filePath.includes(`${path.sep}route.`);
  if (isApiRoute) return { changed: false, reason: "skip api route" };

  const src = read(filePath);
  const looksLikeChatUi = src.includes("/api/chat") && src.includes("fetch(");
  if (!looksLikeChatUi) return { changed: false, reason: "not chat ui" };

  let next = src;
  next = ensureReactImportHasHooks(next);
  next = ensureActiveThreadState(next);
  next = ensureMountLoader(next);
  next = ensureChatFetchSendsThreadId(next);
  next = ensureThreadIdStoredFromResponse(next);

  if (next === src) return { changed: false, reason: "no changes needed" };

  backup(filePath);
  write(filePath, next);
  return { changed: true, reason: "patched" };
}

function main() {
  const srcDir = path.join(ROOT, "src");
  if (!fs.existsSync(srcDir)) {
    console.log("No src folder found, run this from your project root.");
    process.exit(1);
  }

  const files = walk(srcDir);
  const targets = files.filter((f) => {
    const s = read(f);
    return s.includes("/api/chat") && s.includes("fetch(");
  });

  if (targets.length === 0) {
    console.log("No UI files found calling /api/chat.");
    process.exit(0);
  }

  console.log("Found files calling /api/chat:");
  targets.forEach((t) => console.log("  " + path.relative(ROOT, t)));

  console.log("Applying patch, creating .bak_persistence backups.");
  let changedCount = 0;

  for (const f of targets) {
    const r = patchFile(f);
    if (r.changed) changedCount++;
    console.log(path.relative(ROOT, f) + " , " + r.reason);
  }

  console.log("Done. Files changed: " + changedCount);
  console.log("Backups end with .bak_persistence");
}

main();
