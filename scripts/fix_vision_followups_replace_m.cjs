const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_fix_followups_m_replace";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("Marker not found:", MARK);
  process.exit(1);
}

/* Detect the message variable used by the closest messages.map((X) => ...) before the marker */
const before = src.slice(Math.max(0, markIdx - 60000), markIdx);
const mapRe = /messages\s*\.\s*map\s*\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)/g;

let msgVar = null;
for (const m of before.matchAll(mapRe)) msgVar = m[1];

if (!msgVar || msgVar === "m") {
  console.error("Could not detect a non m messages.map variable name before the marker.");
  console.error("Detected:", msgVar);
  process.exit(1);
}

/* Only edit a small window after the marker to avoid touching anything else */
const winStart = markIdx;
const winEnd = Math.min(src.length, markIdx + 2500);
let win = src.slice(winStart, winEnd);

/* Replace only follow ups block m usage */
win = win.replace(/\{m\s*===\s*\(messages as any\)\[visionLastAssistantIndex\]/g, `{${msgVar} === (messages as any)[visionLastAssistantIndex]`);
win = win.replace(/\bm\.role\b/g, `${msgVar}.role`);
win = win.replace(/\bm\./g, `${msgVar}.`);

src = src.slice(0, winStart) + win + src.slice(winEnd);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed Vision follow ups, replaced m with:", msgVar);
console.log("File:", file);
console.log("Backup:", bak);
