const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_no_index";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("VISION_FOLLOWUPS_RENDER marker not found.");
  process.exit(1);
}

// Detect the message variable used in messages.map((msg) => ...)
const lookback = src.slice(Math.max(0, markIdx - 16000), markIdx);
const mapRe = /messages\s*\.\s*map\s*\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)/g;

let msgVar = null;
for (const m of lookback.matchAll(mapRe)) msgVar = m[1] || msgVar;

if (!msgVar) {
  console.error("Could not detect the message variable used in messages.map.");
  process.exit(1);
}

// Patch only a small window after the marker to avoid touching anything else
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 2500);
let win = src.slice(winStart, winEnd);

// Replace any index based condition with object comparison
win = win.replace(
  /\{\s*[A-Za-z_$][A-Za-z0-9_$]*\s*===\s*visionLastAssistantIndex\s*&&\s*showVisionFollowups\s*\?\s*\(/g,
  `{${msgVar} === (messages as any)[visionLastAssistantIndex] && showVisionFollowups ? (`
);

// Replace role plus index based condition too, if present
win = win.replace(
  /\{\s*[A-Za-z_$][A-Za-z0-9_$]*\.role\s*===\s*["']assistant["']\s*&&\s*[A-Za-z_$][A-Za-z0-9_$]*\s*===\s*visionLastAssistantIndex\s*&&\s*showVisionFollowups\s*\?\s*\(/g,
  `{${msgVar} === (messages as any)[visionLastAssistantIndex] && showVisionFollowups ? (`
);

src = src.slice(0, winStart) + win + src.slice(winEnd);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed Vision followups render, removed index dependency.");
console.log("Message var detected:", msgVar);
console.log("File:", file);
console.log("Backup:", bak);
