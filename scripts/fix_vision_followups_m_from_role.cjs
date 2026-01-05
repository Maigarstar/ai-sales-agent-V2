const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_fix_followups_m_from_role";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("Marker not found:", MARK);
  process.exit(1);
}

// Look just before the marker for the closest "<var>.role"
const backStart = Math.max(0, markIdx - 12000);
const before = src.slice(backStart, markIdx);

const roleRe = /([A-Za-z_$][A-Za-z0-9_$]*)\.role\b/g;
let msgVar = null;
for (const m of before.matchAll(roleRe)) {
  const v = m[1];
  // skip obvious non message vars
  if (v === "messages" || v === "prev" || v === "next") continue;
  msgVar = v;
}

if (!msgVar || msgVar === "m") {
  console.error("Could not detect message variable from '<var>.role' near the marker.");
  console.error("Detected:", msgVar);
  console.error("Open VisionWorkspace.tsx near the marker and check what variable is used in your message render.");
  process.exit(1);
}

// Patch only a small window after the marker
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 4500);
let win = src.slice(winStart, winEnd);

// Replace the exact failing condition line fragment
win = win.replace(
  /\{m\s*===\s*\(messages as any\)\[visionLastAssistantIndex\]\s*&&\s*showVisionFollowups\s*\?\s*\(/g,
  `{${msgVar} === (messages as any)[visionLastAssistantIndex] && showVisionFollowups ? (`
);

// Also replace any m.role inside that same block, if present
win = win.replace(/\bm\.role\b/g, `${msgVar}.role`);

src = src.slice(0, winStart) + win + src.slice(winEnd);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed follow ups scope.");
console.log("Replaced m with:", msgVar);
console.log("File:", file);
console.log("Backup:", bak);
