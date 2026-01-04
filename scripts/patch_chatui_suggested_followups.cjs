const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_suggested_followups";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// Remove older follow ups blocks if present
src = src.replace(/\/\*\s*FOLLOWUPS_BEGIN\s*\*\/[\s\S]*?\/\*\s*FOLLOWUPS_END\s*\*\//g, "");

// 1) Extend ChatMessage type
const typeOld = 'type ChatMessage = { role: "user" | "assistant"; content: string };';
const typeNew = 'type ChatMessage = { role: "user" | "assistant"; content: string; suggestions?: string[] };';
if (src.includes(typeOld)) {
  src = src.replace(typeOld, typeNew);
}

// 2) Insert builder function near helpers (after detectIntent)
if (!src.includes("function buildFollowUps(")) {
  const anchor = 'function detectIntent(text: string): Intent {';
  const endNeedle = 'return "unknown";\n}';
  const anchorPos = src.indexOf(anchor);
  const endPos = src.indexOf(endNeedle, anchorPos);

  if (anchorPos !== -1 && endPos !== -1) {
    const insertAt = endPos + endNeedle.length;

    const block = `

/* FOLLOWUPS_BEGIN */
function buildFollowUps(reply: string, intent: Intent): string[] {
  const r = String(reply || "").toLowerCase();

  const couple = [
    "Show me 3 venue ideas for this",
    "Give me a budget split for this",
    "Create a timeline checklist for this",
  ];

  const vendor = [
    "Rewrite my positioning in luxury tone",
    "Give me 5 SEO fixes to do today",
    "Create a premium package offer",
  ];

  const neutral = [
    "Ask me 3 questions to refine this",
    "Summarise options in 3 bullets",
    "What should we decide next",
  ];

  if (intent === "vendor") return vendor;

  if (intent === "couple") {
    if (r.includes("budget")) return ["Break down the budget in detail", "What vendors do we book first", "Create a 12 month plan"];
    if (r.includes("venue") || r.includes("venues")) return ["Compare 3 venues side by side", "What questions should we ask venues", "Suggest the best season for this"];
    return couple;
  }

  return neutral;
}
/* FOLLOWUPS_END */
`;

    src = src.slice(0, insertAt) + block + src.slice(insertAt);
  }
}

// 3) Add suggestions onto assistant replies (both normal send and regenerate/edit path)
const assistantReplyObjRe = /\{\s*role:\s*"assistant"\s*,\s*content:\s*reply\s*\}/g;
src = src.replace(assistantReplyObjRe, '{ role: "assistant", content: reply, suggestions: buildFollowUps(reply, intent) }');

// 4) Render chips under latest assistant reply
// We insert a chips block just before the Regenerate button block inside the assistant render
const regenNeedle = "{i === lastAssistantIndex && !loading ? (";
if (!src.includes("FOLLOWUPS_RENDER")) {
  const idx = src.indexOf(regenNeedle);
  if (idx !== -1) {
    const chips = `
                        {/* FOLLOWUPS_RENDER */}
                        {Array.isArray((m as any).suggestions) &&
                        (m as any).suggestions.length > 0 &&
                        i === lastAssistantIndex &&
                        !loading ? (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {(m as any).suggestions.slice(0, 3).map((s: string, k: number) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleSend(s)}
                                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        ) : null}
`;
    src = src.slice(0, idx) + chips + src.slice(idx);
  }
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
