const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_remove_phantom_setters_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const report = {
  removedTryMobileGate: 0,
  removedTryModeSwitcher: 0,
  removedAnyLineMobileGate: 0,
  removedAnyLineModeSwitcher: 0,
};

// Remove try { setShowMobileModeGate(false); } catch {}
{
  const re = /[ \t]*try\s*\{\s*setShowMobileModeGate\(\s*false\s*\)\s*;\s*\}\s*catch\s*\{\s*\}\s*\n?/g;
  report.removedTryMobileGate = (content.match(re) || []).length;
  content = content.replace(re, "");
}

// Remove try { setShowModeSwitcher(false); } catch {}
{
  const re = /[ \t]*try\s*\{\s*setShowModeSwitcher\(\s*false\s*\)\s*;\s*\}\s*catch\s*\{\s*\}\s*\n?/g;
  report.removedTryModeSwitcher = (content.match(re) || []).length;
  content = content.replace(re, "");
}

// Remove any remaining lines that call these setters, in any form
{
  const re = /^[ \t]*.*setShowMobileModeGate\s*\([^)]*\)\s*;.*\n?/gm;
  report.removedAnyLineMobileGate = (content.match(re) || []).length;
  content = content.replace(re, "");
}
{
  const re = /^[ \t]*.*setShowModeSwitcher\s*\([^)]*\)\s*;.*\n?/gm;
  report.removedAnyLineModeSwitcher = (content.match(re) || []).length;
  content = content.replace(re, "");
}

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Phantom setter cleanup applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Removed try mobile gate calls:", report.removedTryMobileGate);
console.log("Removed try mode switcher calls:", report.removedTryModeSwitcher);
console.log("Removed remaining mobile gate lines:", report.removedAnyLineMobileGate);
console.log("Removed remaining mode switcher lines:", report.removedAnyLineModeSwitcher);
console.log("");
