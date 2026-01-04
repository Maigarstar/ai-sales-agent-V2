const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_pills_placement";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// 1) remove any previously injected pills render block
src = src.replace(
  /\{\s*\/\*\s*VISION_PILLS_RENDER\s*\*\/\s*\}[\s\S]*?\}\s*\)\s*\(\s*\)\s*\}\s*/g,
  ""
);

// 2) ensure helper exists
if (!src.includes("function buildVisionPills(")) {
  // place helper after imports (first blank line after imports)
  const insertAt = src.indexOf("\n\n");
  const helper = `

function buildVisionPills(reply: string): string[] {
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

`;
  if (insertAt !== -1) src = src.slice(0, insertAt) + helper + src.slice(insertAt);
  else src = helper + src;
}

// 3) detect setInput and a send function if present
const hasSetInput = /setInput\s*\(/.test(src);

let sendFn = null;
let sendFnTakesArg = false;

const m1 = src.match(/async function (handleSend|sendMessage)\s*\(([^)]*)\)/);
if (m1) {
  sendFn = m1[1];
  sendFnTakesArg = String(m1[2] || "").trim().length > 0;
} else {
  const m2 = src.match(/const (handleSend|sendMessage)\s*=\s*async\s*\(([^)]*)\)/);
  if (m2) {
    sendFn = m2[1];
    sendFnTakesArg = String(m2[2] || "").trim().length > 0;
  }
}

let clickHandler = "onClick={() => {}}";
if (sendFn && sendFnTakesArg) {
  clickHandler = `onClick={() => ${sendFn}(s)}`;
} else if (sendFn && !sendFnTakesArg && hasSetInput) {
  clickHandler = `onClick={() => { setInput(s); setTimeout(() => ${sendFn}(), 0); }}`;
} else if (hasSetInput) {
  clickHandler = `onClick={() => setInput(s)}`;
}

// 4) insert pills block BEFORE the opening <textarea or <input that contains the placeholder
const needle = "Tell Aura what you are creating";
const idx = src.indexOf(needle);
if (idx === -1) {
  console.error("Could not find placeholder text in VisionWorkspace.tsx:", needle);
  process.exit(1);
}

const beforeNeedle = src.slice(0, idx);
const lastTextarea = beforeNeedle.lastIndexOf("<textarea");
const lastInput = beforeNeedle.lastIndexOf("<input");

const tagStart = Math.max(lastTextarea, lastInput);
if (tagStart === -1) {
  console.error("Could not locate <textarea or <input before placeholder.");
  process.exit(1);
}

// find indentation at tagStart line
const lineStart = src.lastIndexOf("\n", tagStart);
const indent = lineStart === -1 ? "" : src.slice(lineStart + 1, tagStart).match(/^\s*/)?.[0] || "";

const pills = `${indent}{/* VISION_PILLS_RENDER */}
${indent}{(() => {
${indent}  const lastA = [...messages].reverse().find((m: any) => m?.role === "assistant");
${indent}  const list = buildVisionPills(lastA?.content || "");
${indent}  return Array.isArray(list) && list.length ? (
${indent}    <div className="flex flex-wrap gap-2 mb-3">
${indent}      {list.slice(0, 3).map((s: string, k: number) => (
${indent}        <button
${indent}          key={k}
${indent}          type="button"
${indent}          ${clickHandler}
${indent}          className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
${indent}        >
${indent}          {s}
${indent}        </button>
${indent}      ))}
${indent}    </div>
${indent}  ) : null;
${indent}})()}
`;

src = src.slice(0, tagStart) + pills + src.slice(tagStart);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed pills placement in:", file);
console.log("Backup:", bak);
