const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_setter";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const BEGIN = "/* VISION_FOLLOWUPS_BEGIN */";
const END = "/* VISION_FOLLOWUPS_END */";

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const msgStateRe = /const\s*\[\s*messages\s*,\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\]\s*=\s*useState\b/m;
const m = src.match(msgStateRe);
if (!m) {
  console.error("Could not find messages state declaration, expected: const [messages, setter] = useState(...)");
  process.exit(1);
}

const messagesSetter = m[1];

if (!src.includes(BEGIN) || !src.includes(END)) {
  console.error("Follow ups markers not found, stopping to avoid guessing.");
  process.exit(1);
}

const blockRe = new RegExp(esc(BEGIN) + "[\\s\\S]*?" + esc(END), "m");
const blockMatch = src.match(blockRe);
if (!blockMatch) {
  console.error("Follow ups block not found.");
  process.exit(1);
}

let block = blockMatch[0];

// Replace only inside the follow ups block
block = block.replace(/\bsetMessages\b/g, messagesSetter);

src = src.replace(blockRe, block);

fs.writeFileSync(file, src, "utf8");
console.log("Updated follow ups block to use your real messages setter:", messagesSetter);
console.log("File:", file);
console.log("Backup:", bak);
