const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_platinum_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const report = {
  switcherScale: 0,
  switcherSize: 0,
  sidebarGrey: 0,
  projectionGap: 0,
};

function replaceAll(re, replacer, key) {
  const matches = content.match(re);
  if (!matches) return;
  report[key] += matches.length;
  content = content.replace(re, replacer);
}

/* 1) Switcher scale, add md:scale of 1.15 in the switcher container */
replaceAll(
  /className="([^"]*?\bmax-w-md\b[^"]*?\bshadow-xl\b[^"]*?)"/g,
  (m, cls) => {
    if (cls.includes("md:scale-[1.15]")) return m;
    return `className="${cls} md:scale-[1.15] md:origin-center"`;
  },
  "switcherScale"
);

/* If your switcher uses max-w-lg already, still scale it */
replaceAll(
  /className="([^"]*?\bmax-w-lg\b[^"]*?\bshadow-2xl\b[^"]*?)"/g,
  (m, cls) => {
    if (cls.includes("md:scale-[1.15]")) return m;
    return `className="${cls} md:scale-[1.15] md:origin-center"`;
  },
  "switcherScale"
);

/* Optional size nudge, only if the exact snippet exists */
replaceAll(
  /py-3\s+rounded-full\s+text-\[10px\]/g,
  "py-4 rounded-full text-[11px]",
  "switcherSize"
);

/* 2) Harmonize sidebar grey via the theme token, safest pattern */
replaceAll(
  /(\bsidebar\s*:\s*["'])bg-\[#101010\](["'])/g,
  '$1bg-[#141414]$2',
  "sidebarGrey"
);

/* Fallback, if sidebar uses direct class in a sidebar block */
replaceAll(
  /(sidebar[\s\S]{0,220}?bg-)\[#101010\]/g,
  "$1[#141414]",
  "sidebarGrey"
);

/* 3) Projection Canvas spacing, reduce gap on small screens */
replaceAll(
  /\bgrid\s+grid-cols-2\s+gap-4\b/g,
  "grid grid-cols-2 gap-3 md:gap-4",
  "projectionGap"
);

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Platinum polish applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Switcher scale edits:", report.switcherScale);
console.log("Switcher size edits:", report.switcherSize);
console.log("Sidebar grey edits:", report.sidebarGrey);
console.log("Projection spacing edits:", report.projectionGap);
console.log("");

if (
  report.switcherScale === 0 &&
  report.switcherSize === 0 &&
  report.sidebarGrey === 0 &&
  report.projectionGap === 0
) {
  console.log("No matches were found, so nothing changed.");
  console.log("If you want, run: rg \"max-w-md|shadow-xl|sidebar:|bg-\\[#101010\\]|grid grid-cols-2 gap-4\" -n src/app/vision/VisionWorkspace.tsx");
  console.log("");
}
