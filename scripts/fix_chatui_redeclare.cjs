const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");

if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found at:", file);
  process.exit(1);
}

const src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_autofix";
fs.writeFileSync(bak, src, "utf8");

const blockRegex =
  /\n\s*const assistantCountForLead\s*=\s*useMemo\([\s\S]*?\);\s*\n\s*const shouldShowLeadCard\s*=\s*[\s\S]*?;\s*\n\s*const quickPrompts\s*=\s*useMemo\([\s\S]*?\},\s*\[intent\]\s*\);\s*\n/;

if (!blockRegex.test(src)) {
  console.log("No duplicate block found, no changes made.");
  console.log("Backup still created:", bak);
  process.exit(0);
}

const next = src.replace(blockRegex, "\n");

fs.writeFileSync(file, next, "utf8");
console.log("Fixed redeclare issue in:", file);
console.log("Backup saved as:", bak);
