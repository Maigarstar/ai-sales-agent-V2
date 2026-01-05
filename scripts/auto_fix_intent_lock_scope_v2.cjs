const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_fix_intent_lock_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const report = {
  removedBadTopLevelBlock: 0,
  insertedIntentLockedState: 0,
  insertedEffectInsideComponent: 0,
  updatedSwitcherStyleToRespectLock: 0,
};

const hasShowModeSwitcher = /\bsetShowModeSwitcher\b/.test(content) || /\bshowModeSwitcher\b/.test(content);
const hasShowMobileModeGate = /\bsetShowMobileModeGate\b/.test(content) || /\bshowMobileModeGate\b/.test(content);

/* 1) Remove the wrongly inserted top level block that starts with VISION_MODE_KEY */
const badBlockRe =
  /\n*const\s+VISION_MODE_KEY\s*=\s*["']vision_mode["'];[\s\S]*?useEffect\(\(\)\s*=>[\s\S]*?\}\s*,\s*\[[^\]]*\]\s*\)\s*;\s*/m;

if (badBlockRe.test(content)) {
  content = content.replace(badBlockRe, "\n");
  report.removedBadTopLevelBlock += 1;
}

/* 2) Ensure intentLocked state exists inside component */
function insertAfterChatTypeState() {
  const re = /const\s+\[chatType\s*,\s*setChatType\]\s*=\s*useState[^;]*;\s*/m;
  const m = content.match(re);
  if (!m) return false;

  if (/\bintentLocked\b/.test(content)) return false;

  const insert = `\n  const [intentLocked, setIntentLocked] = useState(false);\n`;
  const idx = m.index + m[0].length;
  content = content.slice(0, idx) + insert + content.slice(idx);
  report.insertedIntentLockedState += 1;
  return true;
}

insertAfterChatTypeState();

/* 3) Insert the correct intent lock effect inside component, after chatType and intentLocked */
function insertEffectInsideComponent() {
  if (content.includes("VISION_LOCK_KEY") && content.includes("vision_mode_locked") && content.includes("setIntentLocked(")) {
    return false;
  }

  const anchorRe = /\bconst\s+\[intentLocked\s*,\s*setIntentLocked\]\s*=\s*useState[^;]*;\s*/m;
  const m = content.match(anchorRe);
  if (!m) return false;

  const after = m.index + m[0].length;

  const lines = [];

  lines.push("");
  lines.push("  const VISION_MODE_KEY = \"vision_mode\";");
  lines.push("  const VISION_LOCK_KEY = \"vision_mode_locked\";");
  lines.push("");
  lines.push("  useEffect(() => {");
  lines.push("    if (typeof window === \"undefined\") return;");
  lines.push("");
  lines.push("    const params = new URLSearchParams(window.location.search);");
  lines.push("    const modeFromUrl = params.get(\"mode\");");
  lines.push("    const lockedFromUrl = params.get(\"locked\");");
  lines.push("");
  lines.push("    if (modeFromUrl === \"business\" || modeFromUrl === \"couple\") {");
  lines.push("      setChatType(modeFromUrl as ChatType);");
  lines.push("      try { localStorage.setItem(VISION_MODE_KEY, modeFromUrl); } catch {}");
  lines.push("    }");
  lines.push("");
  lines.push("    if (lockedFromUrl === \"1\") {");
  lines.push("      try { localStorage.setItem(VISION_LOCK_KEY, \"1\"); } catch {}");
  lines.push("    }");
  lines.push("");
  lines.push("    let locked = false;");
  lines.push("    try { locked = localStorage.getItem(VISION_LOCK_KEY) === \"1\"; } catch {}");
  lines.push("");
  lines.push("    if (locked) {");
  lines.push("      setIntentLocked(true);");
  lines.push("      try {");
  lines.push("        const saved = localStorage.getItem(VISION_MODE_KEY);");
  lines.push("        if (saved === \"business\" || saved === \"couple\") setChatType(saved as ChatType);");
  lines.push("      } catch {}");

  if (hasShowMobileModeGate) lines.push("      try { setShowMobileModeGate(false); } catch {}");
  if (hasShowModeSwitcher) lines.push("      try { setShowModeSwitcher(false); } catch {}");

  lines.push("    }");
  lines.push("  }, []);");
  lines.push("");

  const block = lines.join("\n");

  content = content.slice(0, after) + block + content.slice(after);
  report.insertedEffectInsideComponent += 1;
  return true;
}

insertEffectInsideComponent();

/* 4) Ensure the desktop switcher pill respects intentLocked by collapsing when locked
   We patch the common style expression added by the fade away script.
*/
if (hasShowModeSwitcher) {
  const reps = [
    {
      from: /opacity:\s*showModeSwitcher\s*\?\s*1\s*:\s*0/g,
      to: "opacity: (showModeSwitcher && !intentLocked) ? 1 : 0",
    },
    {
      from: /maxHeight:\s*showModeSwitcher\s*\?\s*220\s*:\s*0/g,
      to: "maxHeight: (showModeSwitcher && !intentLocked) ? 220 : 0",
    },
    {
      from: /marginBottom:\s*showModeSwitcher\s*\?\s*12\s*:\s*0/g,
      to: "marginBottom: (showModeSwitcher && !intentLocked) ? 12 : 0",
    },
    {
      from: /pointerEvents:\s*showModeSwitcher\s*\?\s*["']auto["']\s*:\s*["']none["']/g,
      to: "pointerEvents: (showModeSwitcher && !intentLocked) ? \"auto\" : \"none\"",
    },
  ];

  for (const r of reps) {
    const before = (content.match(r.from) || []).length;
    if (before) {
      content = content.replace(r.from, r.to);
      report.updatedSwitcherStyleToRespectLock += before;
    }
  }
} else {
  // If there is no showModeSwitcher system, we still try to hide the pill if it has the common class signature
  const tagRe = /<([A-Za-z0-9_.]+)([^>]*\bclassName\s*=\s*["'][^"']*\bshadow-2xl\b[^"']*["'][^>]*)>/m;
  const m = content.match(tagRe);
  if (m) {
    const full = m[0];
    if (!/style\s*=/.test(full)) {
      const injected = full.replace(/>$/, ' style={{ opacity: intentLocked ? 0 : 1, maxHeight: intentLocked ? 0 : 220, overflow: "hidden", pointerEvents: intentLocked ? "none" : "auto", transition: "all 240ms ease" }}>');
      content = content.replace(full, injected);
      report.updatedSwitcherStyleToRespectLock += 1;
    }
  }
}

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Intent lock scope fix applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Removed bad top level block:", report.removedBadTopLevelBlock);
console.log("Inserted intentLocked state:", report.insertedIntentLockedState);
console.log("Inserted effect inside component:", report.insertedEffectInsideComponent);
console.log("Updated switcher style to respect lock:", report.updatedSwitcherStyleToRespectLock);
console.log("");
