const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_fix_followups_m_scope";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("Marker not found:", MARK);
  process.exit(1);
}

// Look backwards from the marker for the closest ".map((" occurrence
const backWindowStart = Math.max(0, markIdx - 12000);
const backWindow = src.slice(backWindowStart, markIdx);
const mapPos = backWindow.lastIndexOf(".map(");

if (mapPos === -1) {
  console.error("Could not find a .map( close enough above the followups marker.");
  process.exit(1);
}

const fromMap = backWindow.slice(mapPos);

// Capture the first parameter name inside map callback, supports types too
// Examples:
// .map((msg) => ...
// .map((msg, idx) => ...
// .map((msg: any, idx: number) => ...
const paramRe = /\.map\s*\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)/m;
const pm = fromMap.match(paramRe);

const msgVar = pm?.[1] || null;
if (!msgVar) {
  console.error("Could not detect the map message variable name.");
  process.exit(1);
}

// Patch only a small area after the marker, avoid touching the rest of the file
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 3500);
let win = src.slice(winStart, winEnd);

// Replace only the specific followups condition that currently uses m
win = win.replace(
  /\{m\s*===\s*\(messages\s+as\s+any\)\[visionLastAssistantIndex\]\s*&&\s*showVisionFollowups\s*\?\s*\(/g,
  `{${msgVar} === (messages as any)[visionLastAssistantIndex] && showVisionFollowups ? (`
);

// Also replace common m.role usage inside this block, if present
win = win.replace(/\bm\.role\b/g, `${msgVar}.role`);

// Write back
src = src.slice(0, winStart) + win + src.slice(winEnd);
fs.writeFileSync(file, src, "utf8");

console.log("Fixed followups scope, replaced m with:", msgVar);
console.log("Backup saved at:", bak);
