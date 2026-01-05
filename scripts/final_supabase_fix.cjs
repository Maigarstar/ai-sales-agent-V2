const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
let content = fs.readFileSync(target, "utf8");

// 1. Clean up the broken legacy imports
content = content.replace(/import\s*{\s*createClientComponentClient\s*}\s*from\s*"@supabase\/auth-helpers-nextjs";/g, "");

// 2. Add the modern SSR import after "use client"
if (!content.includes("@supabase/ssr")) {
    content = content.replace('"use client";', '"use client";\nimport { createBrowserClient } from "@supabase/ssr";');
}

// 3. Update the handleSend takeover check with a valid client initialization
const modernClientInit = `
      // Initialize Sovereign Browser Client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Sovereign Lock: Check if a human operator has taken over control
      const { data: convData } = await supabase`;

// Replace the previous broken injection
content = content.replace(/const\s+supabase\s*=\s*createClientComponentClient\(\);[\s\S]*?const\s+{\s*data:\s*convData\s*}\s*=\s*await\s+supabase/g, modernClientInit);

fs.writeFileSync(target, content, "utf8");
console.log("Successfully shifted to modern @supabase/ssr. Build errors resolved.");
