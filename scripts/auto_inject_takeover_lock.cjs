const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(target)) {
    console.error("Target file not found:", target);
    process.exit(1);
}

let content = fs.readFileSync(target, "utf8");

// Define the Takeover Check logic
const takeoverCheck = `
      // Sovereign Lock: Check if a human operator has taken over control
      const { data: convData } = await supabase
        .from("conversations")
        .select("takeover_status")
        .eq("id", currentThread.id)
        .single();

      if (convData?.takeover_status === 'human') {
        console.log("Sovereign Lock Active: AI muted for human takeover.");
        setIsLoading(false);
        return;
      }
`;

// Inject the check at the start of the handleSend logic, right after basic validation
if (!content.includes("takeover_status === 'human'")) {
    const handleSendStartPattern = /const handleSend = async\s*\(\)\s*=>\s*\{/m;
    
    if (handleSendStartPattern.test(content)) {
        content = content.replace(handleSendStartPattern, `const handleSend = async () => {\n${takeoverCheck}`);
        fs.writeFileSync(target, content, "utf8");
        console.log("Successfully injected Human Takeover safety check.");
    } else {
        console.error("Could not find handleSend function start.");
    }
} else {
    console.log("Takeover check already exists in the file.");
}
