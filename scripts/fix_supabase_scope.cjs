const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
let content = fs.readFileSync(target, "utf8");

// 1. Identify the Supabase client name used in this file
// It searches for common patterns like "const sb =" or "const supabase ="
const clientMatch = content.match(/const\s+(sb|supabase|supabaseClient|client)\s*=\s*/);
const clientName = clientMatch ? clientMatch[1] : null;

if (!clientName) {
    console.error("Could not find a Supabase client instance in the file. Ensuring import...");
    // Fallback: Add the standard import and client if missing
    if (!content.includes("createClientComponentClient")) {
        content = `import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";\n` + content;
    }
}

const actualClient = clientName || "supabase";

// 2. Fix the injected takeover logic to use the correct variable name
const brokenPattern = /const\s+\{\s*data:\s*convData\s*\}\s*=\s*await\s+supabase/g;
const fixedLogic = `const { data: convData } = await ${actualClient}`;

if (content.includes("await supabase") && actualClient !== "supabase") {
    content = content.replace(brokenPattern, fixedLogic);
    fs.writeFileSync(target, content, "utf8");
    console.log(`Successfully updated takeover check to use client: ${actualClient}`);
} else if (!clientName && !content.includes("const supabase =")) {
    // If no client exists at all, inject a local instance inside handleSend
    content = content.replace(
        "// Sovereign Lock:",
        "const supabase = createClientComponentClient();\n      // Sovereign Lock:"
    );
    fs.writeFileSync(target, content, "utf8");
    console.log("Injected local Supabase client instance into handleSend.");
} else {
    console.log("Supabase scope appears correct or already handled.");
}
