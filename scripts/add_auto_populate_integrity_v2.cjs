const fs = require("fs");
const path = require("path");

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") continue;
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

function findTargetFile(root) {
  const candidates = [
    path.join(root, "src/app/vision/VisionWorkspace.tsx"),
    path.join(root, "src/app/vision/VisionWorkspace.ts"),
  ];

  for (const c of candidates) if (exists(c)) return c;

  const srcDir = path.join(root, "src");
  if (!exists(srcDir)) return null;

  const files = walk(srcDir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  const hits = files.filter(f => {
    const t = fs.readFileSync(f, "utf8");
    return t.includes("const handleSend") && t.includes("streamVision");
  });

  return hits[0] || null;
}

function getIndent(text, index) {
  const nl = text.lastIndexOf("\n", index);
  const lineStart = nl === -1 ? 0 : nl + 1;
  const line = text.slice(lineStart, index);
  const m = line.match(/^\s*/);
  return m ? m[0] : "";
}

function ensureUseRefImport(source) {
  if (source.includes("useRef")) return source;

  // import React, { ... } from "react";
  const r1 = /import\s+React\s*,\s*{\s*([^}]*)\s*}\s*from\s*["']react["'];/m;
  const m1 = source.match(r1);
  if (m1) {
    const inside = m1[1].split(",").map(s => s.trim()).filter(Boolean);
    if (!inside.includes("useRef")) inside.push("useRef");
    const repl = `import React, { ${inside.join(", ")} } from "react";`;
    return source.replace(r1, repl);
  }

  // import { ... } from "react";
  const r2 = /import\s*{\s*([^}]*)\s*}\s*from\s*["']react["'];/m;
  const m2 = source.match(r2);
  if (m2) {
    const inside = m2[1].split(",").map(s => s.trim()).filter(Boolean);
    if (!inside.includes("useRef")) inside.push("useRef");
    const repl = `import { ${inside.join(", ")} } from "react";`;
    return source.replace(r2, repl);
  }

  // import React from "react";
  const r3 = /import\s+React\s+from\s+["']react["'];/m;
  if (r3.test(source)) {
    return source.replace(r3, `import React, { useRef } from "react";`);
  }

  return source;
}

function ensureActiveStreamRef(source) {
  if (source.includes("activeStreamRef")) return source;

  const needle = "const handleSend";
  const idx = source.indexOf(needle);
  if (idx === -1) return source;

  const indent = getIndent(source, idx);
  const insert = `${indent}const activeStreamRef = useRef<string | null>(null);\n\n`;
  return source.slice(0, idx) + insert + source.slice(idx);
}

function findHandleSendBlock(source) {
  const startNeedle = "const handleSend";
  const startIdx = source.indexOf(startNeedle);
  if (startIdx === -1) throw new Error("Could not find handleSend");

  // Find the first { after the arrow
  const arrowIdx = source.indexOf("=>", startIdx);
  if (arrowIdx === -1) throw new Error("Could not find => for handleSend");

  const openIdx = source.indexOf("{", arrowIdx);
  if (openIdx === -1) throw new Error("Could not find opening { for handleSend");

  // Brace match with basic string and comment awareness
  let i = openIdx;
  let depth = 0;

  let inSQ = false;
  let inDQ = false;
  let inTPL = false;
  let inLineComment = false;
  let inBlockComment = false;
  let esc = false;

  for (; i < source.length; i++) {
    const c = source[i];
    const n = source[i + 1];

    if (inLineComment) {
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === "*" && n === "/") { inBlockComment = false; i++; }
      continue;
    }

    if (!inSQ && !inDQ && !inTPL) {
      if (c === "/" && n === "/") { inLineComment = true; i++; continue; }
      if (c === "/" && n === "*") { inBlockComment = true; i++; continue; }
    }

    if (inSQ) {
      if (!esc && c === "'") inSQ = false;
      esc = !esc && c === "\\";
      continue;
    }
    if (inDQ) {
      if (!esc && c === '"') inDQ = false;
      esc = !esc && c === "\\";
      continue;
    }
    if (inTPL) {
      if (!esc && c === "`") inTPL = false;
      esc = !esc && c === "\\";
      continue;
    }

    esc = false;

    if (c === "'") { inSQ = true; continue; }
    if (c === '"') { inDQ = true; continue; }
    if (c === "`") { inTPL = true; continue; }

    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) {
        // Include trailing semicolon, if present
        let end = i + 1;
        while (end < source.length && /\s/.test(source[end])) end++;
        if (source[end] === ";") end++;
        return { startIdx, openIdx, endIdx: end };
      }
    }
  }

  throw new Error("Could not brace match handleSend block");
}

function replaceHandleSend(source) {
  const { startIdx, endIdx } = findHandleSendBlock(source);
  const indent = getIndent(source, startIdx);

  const newHandleSend = [
    "const handleSend = async (overrideInput?: string) => {",
    "  const textToSend = (overrideInput || input).trim();",
    "  if (!textToSend || loading) return;",
    "  if (isListening) stopVoiceVision();",
    "",
    "  const streamKey = uid(\"s\");",
    "  activeStreamRef.current = streamKey;",
    "",
    "  const userMsgId = uid(\"u\");",
    "  const assistantId = uid(\"a\");",
    "",
    "  const userMsg: Message = { id: userMsgId, role: \"user\", content: textToSend };",
    "  const assistantStub: Message = { id: assistantId, role: \"assistant\", content: \"\" };",
    "",
    "  const baseMessages = [...messages, userMsg];",
    "  const isFirstUserTurn = messages.length === 1;",
    "",
    "  setMessages([...baseMessages, assistantStub]);",
    "  setInput(\"\");",
    "  setLoading(true);",
    "",
    "  const stillActive = () => activeStreamRef.current === streamKey;",
    "",
    "  try {",
    "    if (isFirstUserTurn) {",
    "      void fetch(`/api/threads/${activeThreadId}`, {",
    "        method: \"PATCH\",",
    "        headers: { \"Content-Type\": \"application/json\" },",
    "        body: JSON.stringify({ title: textToSend }),",
    "      })",
    "        .then(() => refreshThreads(activeThreadId))",
    "        .catch((err) => console.error(\"Title persistence failed:\", err));",
    "    }",
    "",
    "    // AUTO (P), mark dirty immediately",
    "    scheduleCloudSync(activeThreadId);",
    "",
    "    let currentText = \"\";",
    "    let lastSyncAt = 0;",
    "",
    "    await streamVision(",
    "      { chatType, messages: baseMessages.map((m) => ({ role: m.role, content: m.content })) },",
    "      (delta) => {",
    "        if (!stillActive()) return;",
    "        currentText += delta;",
    "        updateAssistantContent(activeThreadId, assistantId, currentText);",
    "",
    "        const now = Date.now();",
    "        if (now - lastSyncAt > 700) {",
    "          lastSyncAt = now;",
    "          scheduleCloudSync(activeThreadId);",
    "        }",
    "      },",
    "      (meta) => {",
    "        if (!stillActive()) return;",
    "        if (meta.followUps) applyFollowUps(meta.followUps, currentText, baseMessages, chatType);",
    "      }",
    "    );",
    "",
    "    if (!stillActive()) return;",
    "    scheduleCloudSync(activeThreadId);",
    "  } catch (err) {",
    "    updateAssistantContent(activeThreadId, assistantId, \"Connection interrupted. Please send again.\");",
    "    scheduleCloudSync(activeThreadId);",
    "    showToast(\"Connection interrupted. Re calibrating...\");",
    "  } finally {",
    "    if (stillActive()) setLoading(false);",
    "  }",
    "};",
    "",
  ].map(line => (line.length ? indent + line : line)).join("\n");

  return source.slice(0, startIdx) + newHandleSend + source.slice(endIdx);
}

function main() {
  const root = process.cwd();
  const target = findTargetFile(root);

  if (!target) {
    console.error("Could not locate a file containing handleSend and streamVision.");
    process.exit(1);
  }

  const original = fs.readFileSync(target, "utf8");
  const backupPath = `${target}.bak`;

  if (!exists(backupPath)) fs.writeFileSync(backupPath, original, "utf8");

  let next = original;
  next = ensureUseRefImport(next);
  next = ensureActiveStreamRef(next);
  next = replaceHandleSend(next);

  fs.writeFileSync(target, next, "utf8");

  console.log("");
  console.log("AUTO (P) integrity patch applied.");
  console.log("Updated file:", target);
  console.log("Backup created:", backupPath);
  console.log("");
  console.log("Next, run:");
  console.log("  npm run build");
  console.log("");
}

main();
