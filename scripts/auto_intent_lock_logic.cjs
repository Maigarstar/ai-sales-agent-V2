const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(target)) {
    console.error("Target file not found:", target);
    process.exit(1);
}

let content = fs.readFileSync(target, "utf8");

// 1. CLEANUP: Remove non-existent function calls that broke the build
content = content.replace(/try\s*\{\s*setShowMobileModeGate\(false\);\s*\}\s*catch\s*\{\}\n?/g, "");
content = content.replace(/try\s*\{\s*setShowModeSwitcher\(false\);\s*\}\s*catch\s*\{\}\n?/g, "");

// 2. STATE: Add intentLocked state to track pre-selected user paths
if (!content.includes("intentLocked")) {
    content = content.replace(
        /const\s+\[chatType\s*,\s*setChatType\]\s*=\s*useState<ChatType>\("couple"\);/,
        'const [chatType, setChatType] = useState<ChatType>("couple");\n  const [intentLocked, setIntentLocked] = useState(false);'
    );
}

// 3. URL DETECTION: Auto-lock intent if 'mode' or 'locked' parameters exist in the URL
const intentLockEffect = `
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") || params.get("locked") === "1") {
      setIntentLocked(true);
    }
`;
if (!content.includes('params.get("locked") === "1"')) {
    content = content.replace(/setMounted\(true\);/, `setMounted(true);${intentLockEffect}`);
}

// 4. REFINED SCALE: Apply a subtle 5% increase to the persona switcher
content = content.replace("max-w-md shadow-xl", "max-w-[460px] shadow-xl");
content = content.replace("py-3 rounded-full text-[10px]", "py-3.5 rounded-full text-[10.5px]");

// 5. LAYOUT FLOW: Collapse switcher and hide pills if intent is pre-selected
content = content.replace(
    "if (userCount < 2) return null;",
    "if (userCount < 2 || intentLocked) return null;"
);

const switcherContainerPattern = /(<div[^>]*className\s*=\s*["'][^"']*\bshadow-xl\b[^"']*["'][^>]*>)/m;
const match = content.match(switcherContainerPattern);
if (match && !match[0].includes("intentLocked")) {
    const originalTag = match[0];
    const fixedTag = originalTag.replace(
        ">",
        ` style={{ 
            display: intentLocked ? "none" : "flex", 
            opacity: intentLocked ? 0 : 1,
            transition: "all 0.4s ease"
        }}>`
    );
    content = content.replace(originalTag, fixedTag);
}

fs.writeFileSync(target, content, "utf8");
console.log("Platinum Auto-Fix complete: 5% Scale and Intent-Lock applied successfully.");
