const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_intent_lock_types_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const report = {
  removedTryMobileGate: 0,
  removedTryModeSwitcher: 0,
  removedDirectMobileGate: 0,
  removedDirectModeSwitcher: 0,
  switcherTagsPatched: 0,
  switcherTagsSkippedAlreadyLocked: 0,
};

// 1) Remove try catch wrappers calling missing setters
const reTryMobileGate =
  /try\s*\{\s*setShowMobileModeGate\(\s*false\s*\)\s*;\s*\}\s*catch\s*\{\s*\}\s*\n?/g;

const reTryModeSwitcher =
  /try\s*\{\s*setShowModeSwitcher\(\s*false\s*\)\s*;\s*\}\s*catch\s*\{\s*\}\s*\n?/g;

const beforeTryMobile = (content.match(reTryMobileGate) || []).length;
content = content.replace(reTryMobileGate, "");
report.removedTryMobileGate = beforeTryMobile;

const beforeTrySwitcher = (content.match(reTryModeSwitcher) || []).length;
content = content.replace(reTryModeSwitcher, "");
report.removedTryModeSwitcher = beforeTrySwitcher;

// 2) Remove any direct calls to missing setters
const reDirectMobileGate = /^\s*setShowMobileModeGate\([^;]*\);\s*\n/gm;
const reDirectModeSwitcher = /^\s*setShowModeSwitcher\([^;]*\);\s*\n/gm;

const beforeDirectMobile = (content.match(reDirectMobileGate) || []).length;
content = content.replace(reDirectMobileGate, "");
report.removedDirectMobileGate = beforeDirectMobile;

const beforeDirectSwitcher = (content.match(reDirectModeSwitcher) || []).length;
content = content.replace(reDirectModeSwitcher, "");
report.removedDirectModeSwitcher = beforeDirectSwitcher;

// 3) Ensure the switcher pill respects intentLocked
// We patch any div tag whose className contains shadow-2xl, typical of the switcher pill container.
const reSwitcherDiv = /<div\b([^>]*\bclassName\s*=\s*["'][^"']*\bshadow-2xl\b[^"']*["'][^>]*)>/g;

content = content.replace(reSwitcherDiv, (full, props) => {
  if (full.includes("intentLocked")) {
    report.switcherTagsSkippedAlreadyLocked += 1;
    return full;
  }

  // If style={{ ... }} exists, inject display logic at the start
  if (/style=\{\{\s*/.test(full)) {
    report.switcherTagsPatched += 1;
    return full.replace(
      /style=\{\{\s*/,
      'style={{ display: intentLocked ? "none" : undefined, opacity: intentLocked ? 0 : 1, pointerEvents: intentLocked ? "none" : "auto", '
    );
  }

  // If style exists but not an object literal, do not touch it
  if (/style=\{/.test(full)) {
    report.switcherTagsSkippedAlreadyLocked += 1;
    return full;
  }

  // No style prop, add one
  report.switcherTagsPatched += 1;
  return `<div${props} style={{ display: intentLocked ? "none" : undefined, opacity: intentLocked ? 0 : 1, pointerEvents: intentLocked ? "none" : "auto" }}>`;
});

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Intent lock type cleanup applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Removed try mobile gate calls:", report.removedTryMobileGate);
console.log("Removed try mode switcher calls:", report.removedTryModeSwitcher);
console.log("Removed direct mobile gate calls:", report.removedDirectMobileGate);
console.log("Removed direct mode switcher calls:", report.removedDirectModeSwitcher);
console.log("Switcher tags patched:", report.switcherTagsPatched);
console.log("Switcher tags skipped:", report.switcherTagsSkippedAlreadyLocked);
console.log("");
