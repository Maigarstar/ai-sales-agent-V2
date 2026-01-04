const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_dedupe_title_helpers";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const fnNeedle = "function makeThreadTitleFromText";
let positions = [];
let p = 0;
while (true) {
  const i = src.indexOf(fnNeedle, p);
  if (i === -1) break;
  positions.push(i);
  p = i + fnNeedle.length;
}

if (positions.length <= 1) {
  console.log("No duplicate makeThreadTitleFromText found, nothing to change.");
  console.log("Backup saved as:", bak);
  process.exit(0);
}

const blocks = [
  { begin: "/* AUTO_TITLE_SAFE_BEGIN */", end: "/* AUTO_TITLE_SAFE_END */" },
  { begin: "/* AUTO_TITLE_V2_BEGIN */", end: "/* AUTO_TITLE_V2_END */" },
  { begin: "/* AUTO_THREAD_TITLE_BEGIN */", end: "/* AUTO_THREAD_TITLE_END */" },
];

function removeMarkedBlockAt(pos) {
  let best = null;

  for (const b of blocks) {
    const bi = src.lastIndexOf(b.begin, pos);
    if (bi !== -1) {
      const ei = src.indexOf(b.end, pos);
      if (ei !== -1) {
        const endLine = src.indexOf("\n", ei);
        const cutEnd = endLine === -1 ? src.length : endLine + 1;
        if (!best || bi > best.start) best = { start: bi, end: cutEnd };
      }
    }
  }

  if (best) {
    src = src.slice(0, best.start) + src.slice(best.end);
    return true;
  }
  return false;
}

function removeFunctionAt(pos) {
  const lineStart = src.lastIndexOf("\n", pos) + 1;
  const braceStart = src.indexOf("{", pos);
  if (braceStart === -1) return false;

  let depth = 0;
  let i = braceStart;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    i++;
    if (depth === 0) break;
  }

  const endLine = src.indexOf("\n", i);
  const cutEnd = endLine === -1 ? src.length : endLine + 1;

  src = src.slice(0, lineStart) + src.slice(cutEnd);
  return true;
}

// Remove duplicates, keep the first occurrence
for (let k = positions.length - 1; k >= 1; k--) {
  const pos = positions[k];
  const removed = removeMarkedBlockAt(pos) || removeFunctionAt(pos);
  if (!removed) {
    console.error("Could not remove duplicate at position:", pos);
    process.exit(1);
  }
}

fs.writeFileSync(file, src, "utf8");
console.log("Removed duplicate title helper implementations in:", file);
console.log("Backup saved as:", bak);
