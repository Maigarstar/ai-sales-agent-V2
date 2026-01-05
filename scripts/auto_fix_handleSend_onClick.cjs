const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_onClick`;

if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, original, "utf8");
}

const pattern = /onClick\s*=\s*\{\s*handleSend\s*\}/g;
const matches = original.match(pattern) || [];

if (!matches.length) {
  console.log("");
  console.log("No matches found, nothing changed.");
  console.log("File:", target);
  console.log("");
  process.exit(0);
}

const replacement = "onClick={() => { void handleSend(); }}";
const updated = original.replace(pattern, replacement);

fs.writeFileSync(target, updated, "utf8");

console.log("");
console.log("Auto fix applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Replacements:", matches.length);
console.log("");
