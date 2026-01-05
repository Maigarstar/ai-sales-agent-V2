const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_fix_followups_mapvar";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("Marker not found:", MARK);
  process.exit(1);
}

// Look back for the nearest .map((msg, idx) => ...) before the marker
const before = src.slice(Math.max(0, markIdx - 25000), markIdx);
const mapRe = /\.map\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,\s*([A-Za-z_$][A-Za-z0-9_$]*))?\s*\)\s*=>/g;

let msgVar = null;
let idxVar = null;
for (const m of before.matchAll(mapRe)) {
  msgVar = m[1] || msgVar;
  idxVar = m[2] || idxVar;
}

if (!msgVar) {
  console.error("Could not detect the map message variable near the followups marker.");
  console.error("Open the file and search for VISION_FOLLOWUPS_RENDER, then find the nearest .map((X) => above it.");
  process.exit(1);
}

// Patch only a small window after the marker
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 3500);
let win = src.slice(winStart, winEnd);

// Replace m inside the followups block only
win = win.replace(/\bm\b/g, msgVar);

// If an index variable exists and your block had i or index, rewrite those too
if (idxVar) {
  win = win.replace(/\bi\b/g, idxVar);
  win = win.replace(/\bindex\b/g, idxVar);
}

// Write back
src = src.slice(0, winStart) + win + src.slice(winEnd);
fs.writeFileSync(file, src, "utf8");

console.log("Followups block fixed.");
console.log("Detected message var:", msgVar);
console.log("Detected index var:", idxVar || "(none)");
console.log("File:", file);
console.log("Backup:", bak);
