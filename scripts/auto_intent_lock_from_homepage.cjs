const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_intent_lock_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const INSERT_MARKER = "/* Smart Projection Canvas helpers */";

const BLOCK = `
const VISION_MODE_KEY = "vision_mode";
const VISION_LOCK_KEY = "vision_mode_locked";

useEffect(() => {
  if (!mounted) return;
  if (typeof window === "undefined") return;

  const modeFromUrl = searchParams?.get?.("mode");
  const lockedFromUrl = searchParams?.get?.("locked");

  if (modeFromUrl === "business" || modeFromUrl === "couple") {
    setChatType(modeFromUrl as ChatType);
    try {
      localStorage.setItem(VISION_MODE_KEY, modeFromUrl);
    } catch {}
  }

  if (lockedFromUrl === "1") {
    try {
      localStorage.setItem(VISION_LOCK_KEY, "1");
    } catch {}
  }

  let locked = false;
  try {
    locked = localStorage.getItem(VISION_LOCK_KEY) === "1";
  } catch {}

  if (locked) {
    // Lock means, no pill, no mobile gate
    try {
      const saved = localStorage.getItem(VISION_MODE_KEY);
      if (saved === "business" || saved === "couple") setChatType(saved as ChatType);
    } catch {}

    try {
      setShowMobileModeGate(false);
    } catch {}

    try {
      setShowModeSwitcher(false);
    } catch {}
  }
}, [mounted, searchParams]);
`;

if (!content.includes("VISION_LOCK_KEY") && content.includes(INSERT_MARKER)) {
  content = content.replace(INSERT_MARKER, `${INSERT_MARKER}\n\n${BLOCK}\n`);
}

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Intent lock patch applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("");
