const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");

if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_autotitle_redeclare";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const re =
  /\n\s*const shouldAutoTitle = serverMode && messages\.every\(\(m\) => m\.role !== "user"\);\s*\n\s*let threadForTitle = activeThreadId;\s*\n[\s\S]*?\n\s*const id = await startConversationIfNeeded\(\);\s*\n/g;

const matches = src.match(re) || [];
if (matches.length <= 1) {
  console.log("No duplicate shouldAutoTitle block found, no changes made.");
  console.log("Backup saved as:", bak);
  process.exit(0);
}

let first = true;
src = src.replace(re, (m) => {
  if (first) {
    first = false;
    return m;
  }
  return "\n";
});

fs.writeFileSync(file, src, "utf8");
console.log("Removed duplicate shouldAutoTitle blocks in:", file);
console.log("Backup saved as:", bak);
