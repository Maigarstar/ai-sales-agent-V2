const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_vision_followups";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

function has(s) {
  return src.includes(s);
}

// Remove older block if re run
src = src.replace(/\/\*\s*VISION_FOLLOWUPS_BEGIN\s*\*\/[\s\S]*?\/\*\s*VISION_FOLLOWUPS_END\s*\*\//g, "");

// Ensure Message type has suggestions
src = src.replace(
  /type\s+Message\s*=\s*\{([\s\S]*?)\};/m,
  (m, inner) => {
    if (inner.includes("suggestions?:")) return m;
    return `type Message = {${inner}\n  suggestions?: string[];\n};`;
  }
);

// Insert helper and memo near top, after types
if (!has("VISION_FOLLOWUPS_BEGIN")) {
  const insertAfter = "type Message";
  const pos = src.indexOf(insertAfter);
  if (pos === -1) {
    console.error("Could not find Message type anchor in VisionWorkspace.tsx");
    process.exit(1);
  }

  const block = `

/* VISION_FOLLOWUPS_BEGIN */
function buildVisionFollowUps(reply) {
  const r = String(reply || "").toLowerCase();

  if (r.includes("planner")) {
    return [
      "Which country or city are you considering",
      "How many guests, and what season",
      "What is your comfortable budget range",
    ];
  }

  if (r.includes("venue")) {
    return [
      "Compare 3 venues side by side",
      "What questions should we ask venues",
      "Suggest the best season for this",
    ];
  }

  if (r.includes("budget")) {
    return [
      "Break down the budget in detail",
      "What vendors do we book first",
      "Create a 12 month plan",
    ];
  }

  return [
    "Ask me 3 questions to refine this",
    "Summarise options in 3 bullets",
    "What should we decide next",
  ];
}
/* VISION_FOLLOWUPS_END */
`;
  src = src.slice(0, pos) + block + src.slice(pos);
}

// Find a sender function name in VisionWorkspace
let senderName = null;
let senderTakesArg = false;

const fnSig1 = src.match(/async function (handleSend|sendMessage)\s*\(([^)]*)\)/);
if (fnSig1) {
  senderName = fnSig1[1];
  senderTakesArg = String(fnSig1[2] || "").trim().length > 0;
} else {
  const fnSig2 = src.match(/const (handleSend|sendMessage)\s*=\s*async\s*\(([^)]*)\)/);
  if (fnSig2) {
    senderName = fnSig2[1];
    senderTakesArg = String(fnSig2[2] || "").trim().length > 0;
  }
}

if (!senderName) {
  // fallback, still render chips, click will fill input
  senderName = null;
}

// Ensure suggestedFollowUps memo exists, after messages state
if (!has("const suggestedFollowUps")) {
  const messagesStateIdx = src.search(/const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState/);
  if (messagesStateIdx === -1) {
    console.error("Could not find messages state in VisionWorkspace.tsx");
    process.exit(1);
  }

  // insert after the first semicolon after messages state line
  const semi = src.indexOf(";", messagesStateIdx);
  if (semi === -1) {
    console.error("Could not locate end of messages state line");
    process.exit(1);
  }

  const memo = `

  const suggestedFollowUps = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return [];
    const list = Array.isArray(lastAssistant.suggestions) && lastAssistant.suggestions.length
      ? lastAssistant.suggestions
      : buildVisionFollowUps(lastAssistant.content);
    return Array.isArray(list) ? list.slice(0, 3) : [];
  }, [messages]);
`;
  src = src.slice(0, semi + 1) + memo + src.slice(semi + 1);
}

// Insert render row above the composer, anchor on placeholder text you are using in Vision
const placeholderNeedle = "Tell Aura what you are creating";
if (has(placeholderNeedle) && !has("VISION_FOLLOWUPS_RENDER")) {
  const idx = src.indexOf(placeholderNeedle);
  const lineStart = src.lastIndexOf("\n", idx);

  // Try to insert just before the input or textarea that contains the placeholder line
  const insertPoint = lineStart === -1 ? idx : lineStart;

  const clickHandler = senderName
    ? (senderTakesArg
        ? `onClick={() => ${senderName}(s)}`
        : `onClick={() => { setInput(s); setTimeout(() => ${senderName}(), 0); }}`
      )
    : `onClick={() => setInput(s)}`;

  const render = `
              {/* VISION_FOLLOWUPS_RENDER */}
              {Array.isArray(suggestedFollowUps) && suggestedFollowUps.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedFollowUps.slice(0, 3).map((s, k) => (
                    <button
                      key={k}
                      type="button"
                      ${clickHandler}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
`;

  src = src.slice(0, insertPoint) + render + src.slice(insertPoint);
}

// When adding assistant replies, attach suggestions if we can find a common pattern
// Replace content only assistant inserts, very conservative
src = src.replace(
  /\{\s*role:\s*"assistant"\s*,\s*content:\s*([a-zA-Z0-9_$.]+)\s*\}/g,
  (m, contentVar) => {
    if (m.includes("suggestions")) return m;
    return `{ role: "assistant", content: ${contentVar}, suggestions: buildVisionFollowUps(${contentVar}) }`;
  }
);

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
