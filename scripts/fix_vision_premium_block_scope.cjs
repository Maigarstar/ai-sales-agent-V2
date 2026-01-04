const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_premium_scope_fix";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// remove any existing premium block, anywhere
src = src.replace(
  /\/\*\s*PREMIUM_VISION_BEGIN\s*\*\/[\s\S]*?\/\*\s*PREMIUM_VISION_END\s*\*\//g,
  ""
);

// ensure useRef exists in the react import
if (!src.includes("useRef")) {
  src = src.replace(
    /import\s+React\s*,\s*\{([^}]*)\}\s+from\s+["']react["'];/m,
    (m, inner) => {
      const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
      if (!parts.includes("useRef")) parts.push("useRef");
      return `import React, { ${parts.join(", ")} } from "react";`;
    }
  );
}

// find component start
const compStart =
  src.search(/export\s+default\s+function\s+VisionWorkspace\s*\(/) !== -1
    ? src.search(/export\s+default\s+function\s+VisionWorkspace\s*\(/)
    : src.search(/function\s+VisionWorkspace\s*\(/);

if (compStart === -1) {
  console.error("Could not find VisionWorkspace component function.");
  process.exit(1);
}

const after = src.slice(compStart);

// find best messages state tuple inside the component region
const stateRe = /const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\]\s*=\s*useState[\s\S]*?;/g;

let best = null;
let m;
while ((m = stateRe.exec(after)) !== null) {
  const stateName = m[1];
  const setterName = m[2];
  let score = 0;

  if (setterName === "setMessages") score += 5;
  if (stateName === "messages") score += 4;
  if (String(stateName).toLowerCase().includes("messages")) score += 3;
  if (String(setterName).includes("Messages")) score += 2;

  const lookAhead = after.slice(m.index, m.index + 4000);
  if (lookAhead.includes(`${stateName}.map(`)) score += 2;
  if (lookAhead.includes(`${setterName}(`)) score += 1;

  if (!best || score > best.score) {
    best = { score, stateName, setterName, index: m.index, len: m[0].length };
  }
}

if (!best) {
  console.error("Could not detect a messages state tuple in VisionWorkspace.");
  process.exit(1);
}

const stateName = best.stateName;
const setterName = best.setterName;

const hasActiveThreadId = after.includes("activeThreadId");
const premiumBlock = `
  /* PREMIUM_VISION_BEGIN */
  const followUpsDoneRef = useRef<Set<string>>(new Set());
  const titledThreadsRef = useRef<Set<string>>(new Set());

  function pickLastUserText(list: any[]) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list?.[i]?.role === "user") {
        const t = String(list[i]?.content || "").trim();
        if (t) return t;
      }
    }
    return "";
  }

  function makePremiumTitle(text: string) {
    const clean = String(text || "")
      .replace(/\\s+/g, " ")
      .replace(/[\\u2018\\u2019\\u201C\\u201D"'\\\`]/g, "")
      .trim();

    if (!clean) return "Conversation";
    if (clean.length <= 56) return clean;
    return clean.slice(0, 56) + "…";
  }

  useEffect(() => {
    const list: any[] = (${stateName} as any[]) || [];

    const lastAssistantIndex = (() => {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i]?.role === "assistant") return i;
      }
      return -1;
    })();

    if (lastAssistantIndex < 0) return;

    const lastA: any = list[lastAssistantIndex];
    if (Array.isArray(lastA?.suggestions) && lastA.suggestions.length) return;

    const key = String(lastAssistantIndex) + ":" + String(lastA?.content || "").slice(0, 120);
    if (followUpsDoneRef.current.has(key)) return;
    followUpsDoneRef.current.add(key);

    (async () => {
      try {
        const userMessage = pickLastUserText(list);
        const res = await fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flow: "aura",
            userMessage,
            reply: String(lastA?.content || ""),
          }),
        });

        if (!res.ok) return;
        const data = await res.json().catch(() => ({} as any));
        const followUps = Array.isArray(data?.followUps) ? data.followUps : [];
        if (!followUps.length) return;

        ${setterName}((prev: any) => {
          const copy = Array.isArray(prev) ? [...prev] : [];
          const m = copy[lastAssistantIndex];
          if (!m || m.role !== "assistant") return prev;
          if (Array.isArray(m?.suggestions) && m.suggestions.length) return prev;
          copy[lastAssistantIndex] = { ...m, suggestions: followUps.slice(0, 3) };
          return copy;
        });
      } catch {
        // ignore
      }
    })();
  }, [${stateName}]);

  ${hasActiveThreadId ? `
  useEffect(() => {
    if (!activeThreadId) return;
    if (titledThreadsRef.current.has(activeThreadId)) return;

    const firstUser = (${stateName} as any[]).find((m: any) => m?.role === "user" && String(m?.content || "").trim());
    if (!firstUser) return;

    const title = makePremiumTitle(String(firstUser.content || ""));
    titledThreadsRef.current.add(activeThreadId);

    fetch(\`/api/threads/\${activeThreadId}/title\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  }, [activeThreadId, ${stateName}]);
  ` : ""}

  /* PREMIUM_VISION_END */
`;

// insert premium block immediately after the detected state tuple, inside component region
const insertAt = compStart + best.index + best.len;
src = src.slice(0, insertAt) + "\n" + premiumBlock + "\n" + src.slice(insertAt);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed premium block scope in:", file);
console.log("Backup:", bak);
console.log("Detected messages state:", stateName, "and setter:", setterName);
