const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_followups_stray_brace";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// Remove a single standalone "{" line that appears immediately before the FOLLOWUPS_RENDER comment
// Pattern: newline, spaces, "{", newline, spaces, "{/* FOLLOWUPS_RENDER */}"
src = src.replace(/\n([ \t]*)\{\s*\n([ \t]*)\{\/\*\s*FOLLOWUPS_RENDER\s*\*\/\}/g, "\n$2{/* FOLLOWUPS_RENDER */}");

fs.writeFileSync(file, src, "utf8");
console.log("Fixed stray brace before FOLLOWUPS_RENDER");
console.log("Backup saved as:", bak);
