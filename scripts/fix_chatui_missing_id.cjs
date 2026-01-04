const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_missing_id";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// If id is already declared anywhere, do nothing
if (src.includes("const id = await startConversationIfNeeded();")) {
  console.log("id declaration already present, no change made.");
  console.log("Backup saved as:", bak);
  process.exit(0);
}

// Insert id declaration just before the fetch that uses conversationId: id
const anchor = 'const res = await fetch("/api/vendors-chat",';
if (!src.includes(anchor)) {
  console.error('Anchor not found: ' + anchor);
  process.exit(1);
}

src = src.replace(
  anchor,
  `const id = await startConversationIfNeeded();\n\n      ${anchor}`
);

fs.writeFileSync(file, src, "utf8");
console.log("Inserted missing id declaration in:", file);
console.log("Backup saved as:", bak);
