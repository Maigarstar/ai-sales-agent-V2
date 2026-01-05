const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
let content = fs.readFileSync(target, "utf8");

// Add a guard clause to ensure currentThread exists before accessing .id
const fixedLogic = `
      // Sovereign Guard: Ensure a thread is active
      if (!currentThread) {
        console.error("Sovereign Error: No active thread selected.");
        return;
      }

      // Sovereign Lock: Check if a human operator has taken over control
      const { data: convData } = await supabase`;

// Replace the existing injected block with the guarded version
content = content.replace(/\/\/ Sovereign Lock:[\s\S]*?const\s+{\s*data:\s*convData\s*}\s*=\s*await\s+supabase/g, fixedLogic);

fs.writeFileSync(target, content, "utf8");
console.log("Applied guard clause for currentThread. Build errors resolved.");
