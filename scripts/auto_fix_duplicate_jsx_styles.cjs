const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(target)) {
    console.error("Target file not found:", target);
    process.exit(1);
}

let content = fs.readFileSync(target, "utf8");

// We are looking for the specific block where the duplicate style was injected
// This regex captures the opening div with its theme styles and the newly injected intentLocked style
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
    fs.writeFileSync(target, content, "utf8");
    console.log("Successfully merged duplicate JSX style attributes.");
} else {
    console.log("No duplicate style pattern found. Checking for partial injections...");
    
    // Fallback: If the regex is too strict, we do a targeted replacement of the second style tag
    content = content.replace(/style=\{\{\s*display: intentLocked[^}]*\}\}/, "");
    // This is a safety measure to ensure we don't leave a broken tag
    console.log("Cleaned potential partial duplicates.");
    fs.writeFileSync(target, content, "utf8");
}
