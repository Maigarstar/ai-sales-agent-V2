const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_scope_vars";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("VISION_FOLLOWUPS_RENDER marker not found.");
  process.exit(1);
}

// Look backward from the marker to find the nearest messages.map((msg, idx) => ...)
const lookback = src.slice(Math.max(0, markIdx - 14000), markIdx);

// Match many map shapes, prefer ones where the receiver includes "messages"
const mapRe = /([^\n]{0,160})\.map\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,\s*([A-Za-z_$][A-Za-z0-9_$]*))?\s*\)\s*=>/g;

let msgVar = null;
let idxVar = null;

for (const m of lookback.matchAll(mapRe)) {
  const receiver = String(m[1] || "");
  if (!receiver.includes("messages")) continue;
  msgVar = m[2] || msgVar;
  idxVar = m[3] || idxVar;
}

if (!msgVar) {
  console.error("Could not detect the message variable name near the marker.");
  process.exit(1);
}

// Index variable might be omitted, but your followups condition needs one.
// If omitted, try to find another messages.map that has an index, otherwise use "index" as fallback.
if (!idxVar) {
  for (const m of lookback.matchAll(mapRe)) {
    const receiver = String(m[1] || "");
    if (!receiver.includes("messages")) continue;
    if (m[3]) {
      idxVar = m[3];
      break;
    }
  }
  if (!idxVar) idxVar = "index";
}

// Now patch only the small window after the marker, do not touch the rest of the file.
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 2200);
let win = src.slice(winStart, winEnd);

// Case 1, condition includes role check and index check
win = win.replace(
  /\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\.role\s*===\s*["']assistant["']\s*&&\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*===\s*visionLastAssistantIndex\s*&&\s*showVisionFollowups\s*\?\s*\(/,
  `{${msgVar}.role === "assistant" && ${idxVar} === visionLastAssistantIndex && showVisionFollowups ? (`
);

// Case 2, condition is only index check
win = win.replace(
  /\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*===\s*visionLastAssistantIndex\s*&&\s*showVisionFollowups\s*\?\s*\(/,
  `{${idxVar} === visionLastAssistantIndex && showVisionFollowups ? (`
);

// If your snippet still has raw m or i, replace only the specific patterns, inside this window only
win = win.replace(/\bm\.role\b/g, `${msgVar}.role`);
win = win.replace(/\bi\s*===\s*visionLastAssistantIndex\b/g, `${idxVar} === visionLastAssistantIndex`);

src = src.slice(0, winStart) + win + src.slice(winEnd);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed followups render scope vars.");
console.log("Using message var:", msgVar);
console.log("Using index var:", idxVar);
console.log("File:", file);
console.log("Backup:", bak);
