const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_state";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

function has(s) {
  return src.includes(s);
}

if (!has("export default function VisionWorkspace")) {
  console.error("VisionWorkspace export not found, stopping.");
  process.exit(1);
}

/* 1) Ensure followups state exists in component scope */
if (!has("const [followupsDismissed, setFollowupsDismissed]")) {
  const reMessages =
    /const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState(?:<[^>]*>)?\([^;]*\);\s*/m;

  if (reMessages.test(src)) {
    src = src.replace(reMessages, (m) => {
      return (
        m +
        `\n  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(false);\n` +
        `  const followupsShownRef = useRef<number>(0);\n` +
        `  const followupsDoneIdsRef = useRef<Set<string>>(new Set());\n`
      );
    });
  } else {
    // Fallback, place near top of VisionWorkspace body
    const wsIdx = src.indexOf("export default function VisionWorkspace");
    const braceIdx = src.indexOf("{", wsIdx);
    if (braceIdx === -1) {
      console.error("Could not find VisionWorkspace opening brace, stopping.");
      process.exit(1);
    }

    src =
      src.slice(0, braceIdx + 1) +
      `\n  const [followupsDismissed, setFollowupsDismissed] = useState<boolean>(false);\n` +
      `  const followupsShownRef = useRef<number>(0);\n` +
      `  const followupsDoneIdsRef = useRef<Set<string>>(new Set());\n` +
      src.slice(braceIdx + 1);
  }
}

/* 2) Make the chip click ultra safe, it will fill input and dismiss chips
      (no guessing your send function name, zero risk) */
if (has("/* VISION_FOLLOWUPS_BEGIN */") && has("function onVisionFollowupClick")) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const begin = "function onVisionFollowupClick";
  const re = new RegExp(esc(begin) + "[\\s\\S]*?\\n\\s*\\}", "m");

  src = src.replace(re, `function onVisionFollowupClick(t: string): void {
    setFollowupsDismissed(true);
    try {
      setInput(t);
    } catch {
      // ignore
    }
  }`);
}

fs.writeFileSync(file, src, "utf8");
console.log("Fixed followups state:", file);
console.log("Backup:", bak);
