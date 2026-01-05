/* AUTO (P) Integrity Patch
   Patches handleSend to be:
   - optimistic UI
   - assistant stub always created
   - background title PATCH
   - immediate scheduleCloudSync
   - stream integrity guard
*/

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
    path.join(root, "src/app/admin/dashboard/chat/page.tsx"),
    path.join(root, "src/app/admin/dashboard/chat/page.ts"),
  ];

  for (const c of candidates) if (exists(c)) return c;

  const srcDir = path.join(root, "src");
  if (!exists(srcDir)) return null;

  const files = walk(srcDir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  const hits = files.filter(f => {
    const t = fs.readFileSync(f, "utf8");
    return t.includes("const handleSend = async") && t.includes("streamVision");
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

function replaceHandleSend(source) {
  const startNeedle = "const handleSend = async";
  const startIdx = source.indexOf(startNeedle);
  if (startIdx === -1) throw new Error("Could not find handleSend");

  // Find the end of the handleSend const statement by scanning for the next "\n};"
  // Prefer the first occurrence after the start index that looks like the end of the const.
  const endNeedle = "\n};";
  const endIdx = source.indexOf(endNeedle, startIdx);
  if (endIdx === -1) throw new Error("Could not find end of handleSend (expected \\n};)");

  const blockEnd = endIdx + endNeedle.length;

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
    "",
    "  // Optimistic UI, always immediate",
    "  setMessages([...baseMessages, assistantStub]);",
    "  setInput(\"\");",
    "  setLoading(true);",
    "",
    "  const stillActive = () => activeStreamRef.current === streamKey;",
    "",
    "  try {",
    "    // Background title persistence, never blocks streaming",
    "    if (messages.length === 1) {",
    "      void fetch(`/api/threads/${activeThreadId}`, {",
    "        method: \"PATCH\",",
    "        headers: { \"Content-Type\": \"application/json\" },",
    "        body: JSON.stringify({ title: textToSend }),",
    "      })",
    "        .then(() => refreshThreads(activeThreadId))",
    "        .catch((err) => console.error(\"Title persistence failed:\", err));",
    "    }",
    "",
    "    // AUTO (P), mark thread dirty immediately",
    "    scheduleCloudSync(activeThreadId);",
    "",
    "    let currentText = \"\";",
    "    let lastSyncAt = 0;",
    "",
    "    await streamVision(",
    "      { chatType, messages: baseMessages.map((m) => ({ role: m.role, content: m.content })) },",
    "      (delta) => {",
    "        if (!stillActive()) return;",
    "",
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
    "",
    "    // Final flush",
    "    scheduleCloudSync(activeThreadId);",
    "  } catch (err) {",
    "    // Never leave a blank assistant bubble",
    "    updateAssistantContent(activeThreadId, assistantId, \"Connection interrupted. Please send again.\");",
    "    scheduleCloudSync(activeThreadId);",
    "    showToast(\"Connection interrupted. Re calibrating...\");",
    "  } finally {",
    "    if (stillActive()) setLoading(false);",
    "  }",
    "};",
    "",
  ].map(line => (line.length ? indent + line : line)).join("\n");

  return source.slice(0, startIdx) + newHandleSend + source.slice(blockEnd);
}

function ensureActiveStreamRef(source) {
  if (source.includes("activeStreamRef")) return source;

  const needle = "const handleSend = async";
  const idx = source.indexOf(needle);
  if (idx === -1) return source;

  const indent = getIndent(source, idx);
  const insert = `${indent}const activeStreamRef = useRef<string | null>(null);\n\n`;
  return source.slice(0, idx) + insert + source.slice(idx);
}

function main() {
  const root = process.cwd();
  const target = findTargetFile(root);

  if (!target) {
    console.error("Could not locate a target file containing handleSend and streamVision.");
    process.exit(1);
  }

  const original = fs.readFileSync(target, "utf8");
  const backupPath = `${target}.bak`;

  if (!exists(backupPath)) {
    fs.writeFileSync(backupPath, original, "utf8");
  }

  let next = original;
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
