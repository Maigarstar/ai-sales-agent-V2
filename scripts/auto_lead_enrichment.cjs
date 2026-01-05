const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
let content = fs.readFileSync(target, "utf8");

// 1. Add the Lead Enrichment call to the message sending logic
const enrichmentLogic = `
      // Lead Enrichment: Automatically extract names/details if this is the first turn
      if (userTurns === 0 && finalText.length > 5) {
        fetch("/api/leads/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            threadId: currentThread.id, 
            content: finalText,
            organisation_id: currentThread.organisation_id 
          }),
        }).catch(() => null);
      }
`;

if (!content.includes("api/leads/enrich")) {
    // Insert right after the final assistant text is updated in handleSend
    content = content.replace(
        /updateAssistantContent\(currentThread\.id, assistantId, finalText\);/m,
        `updateAssistantContent(currentThread.id, assistantId, finalText);${enrichmentLogic}`
    );
}

fs.writeFileSync(target, content, "utf8");
console.log("Lead Enrichment logic integrated into workspace.");
