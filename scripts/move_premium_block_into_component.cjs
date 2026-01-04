const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_move_premium_block";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// 1) ensure useRef is imported
src = src.replace(
  /import\s+React\s*,\s*\{([^}]+)\}\s+from\s+["']react["'];/m,
  (m, inner) => {
    if (inner.includes("useRef")) return m;
    return `import React, { ${inner.trim().replace(/\s+/g, " ")}, useRef } from "react";`;
  }
);

// 2) extract PREMIUM block if it exists
const blockRe = /\/\*\s*PREMIUM_VISION_BEGIN\s*\*\/[\s\S]*?\/\*\s*PREMIUM_VISION_END\s*\*\//m;
const blockMatch = src.match(blockRe);

if (!blockMatch) {
  console.error("No PREMIUM_VISION block found in VisionWorkspace.tsx. Nothing to move.");
  process.exit(1);
}

const premiumBlock = blockMatch[0];

// 3) remove it from wherever it is
src = src.replace(blockRe, "");

// 4) insert it right after the messages state line inside the component
const messagesStateRe =
  /const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState[\s\S]*?;\s*/m;

const m = src.match(messagesStateRe);
if (!m) {
  console.error("Could not find messages state line: const [messages, setMessages] = useState(...);");
  process.exit(1);
}

const insertAt = m.index + m[0].length;
src = src.slice(0, insertAt) + "\n\n" + premiumBlock + "\n\n" + src.slice(insertAt);

fs.writeFileSync(file, src, "utf8");
console.log("Moved PREMIUM block into component scope:", file);
console.log("Backup:", bak);
