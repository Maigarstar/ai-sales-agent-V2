const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_font_16_to_14`;

if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, original, "utf8");
}

// Replace numeric fontSize: 16 with 14 (avoid 160, 216, etc)
const reNum = /(\bfontSize\s*:\s*)16(?!\d)/g;

// Replace string fontSize: "16px" or '16px' with 14px
const rePx = /(\bfontSize\s*:\s*)(["'])16px\2/g;

let updated = original;
const beforeNum = (updated.match(reNum) || []).length;
updated = updated.replace(reNum, "$114");

const beforePx = (updated.match(rePx) || []).length;
updated = updated.replace(rePx, '$1$214px$2');

fs.writeFileSync(target, updated, "utf8");

console.log("");
console.log("Projection Canvas font update applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Replaced numeric fontSize:16 count:", beforeNum);
console.log("Replaced string fontSize:\"16px\" count:", beforePx);
console.log("");
