const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_stray_json_catch";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// 1) remove any standalone ".catch(() => ({}));" line
src = src.replace(/^\s*\.catch\(\(\)\s*=>\s*\(\{\}\)\)\s*;\s*$/gm, "");

// 2) upgrade "const data = await res.json()" so it always has a catch
src = src.replace(
  /const\s+data\s*=\s*await\s+res\.json\(\)\s*;?/g,
  "const data = await res.json().catch(() => ({} as any));"
);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed:", file);
console.log("Backup:", bak);
