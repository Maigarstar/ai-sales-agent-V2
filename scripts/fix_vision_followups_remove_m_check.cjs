const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_fix_followups_m";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

/*
  Replace:
  {m.role === "assistant" && i === visionLastAssistantIndex && showVisionFollowups ? (
  With:
  {i === visionLastAssistantIndex && showVisionFollowups ? (
*/
const re = /\{\s*m\.role\s*===\s*["']assistant["']\s*&&\s*i\s*===\s*visionLastAssistantIndex\s*&&\s*showVisionFollowups\s*\?\s*\(/g;

const before = src;
src = src.replace(re, "{i === visionLastAssistantIndex && showVisionFollowups ? (");

if (src === before) {
  console.error("Pattern not found, no changes made. Paste the exact line containing VISION_FOLLOWUPS_RENDER and I will match it precisely.");
  process.exit(1);
}

fs.writeFileSync(file, src, "utf8");
console.log("Fixed follow ups render by removing m.role check.");
console.log("File:", file);
console.log("Backup:", bak);
