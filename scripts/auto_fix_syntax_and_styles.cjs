const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(target)) {
    console.error("Target file not found:", target);
    process.exit(1);
}

let content = fs.readFileSync(target, "utf8");

// 1. Fix the duplicate style attribute and merge into one clean Sovereign block
const duplicateStylePattern = /style=\{\{\s*borderColor:[\s\S]*?background:[\s\S]*?\}\}\s*style=\{\{\s*display: intentLocked[\s\S]*?\}\}/g;

const mergedStyleReplacement = `style={{ 
                        borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)",
                        background: isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                        display: intentLocked ? "none" : "flex", 
                        opacity: intentLocked ? 0 : 1,
                        transition: "all 0.4s ease"
                      }}`;

if (duplicateStylePattern.test(content)) {
    content = content.replace(duplicateStylePattern, mergedStyleReplacement);
}

// 2. Syntax Check: Ensure no stray characters or broken tags exist right before the map function
// We look for the Persona Switcher's closing div and the start of the AnimatePresence block
content = content.replace(
  /<\/div>\s*<\/div>\s*<AnimatePresence>\s*\{messages\.map/g,
  `</div>
                </div>

                <AnimatePresence>
                  {messages.map`
);

// 3. Fallback: If map is still failing, ensure it is wrapped in valid braces
if (!content.includes("{messages.map((m) => {")) {
    content = content.replace("messages.map((m) =>", "{messages.map((m) =>");
}

fs.writeFileSync(target, content, "utf8");
console.log("Syntax recovery complete. JSX style consolidation applied.");
