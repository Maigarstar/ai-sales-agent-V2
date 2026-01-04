const fs = require("fs");
const path = require("path");

const root = process.cwd();
const visionDir = path.join(root, "src/app/vision");

function listTsx(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...listTsx(p));
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

const files = fs.existsSync(visionDir) ? listTsx(visionDir) : [];
if (!files.length) {
  console.error("No .tsx files found under src/app/vision");
  process.exit(1);
}

const needle = "Tell Aura what you are creating";
const targets = files.filter((f) => read(f).includes(needle));

if (!targets.length) {
  console.error("Could not find the Vision file containing:", needle);
  console.error("Searched:", visionDir);
  process.exit(1);
}

function stripBlock(src, begin, end) {
  const re = new RegExp(
    begin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "[\\s\\S]*?" +
      end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "g"
  );
  return src.replace(re, "");
}

for (const file of targets) {
  let src = read(file);
  const bak = file + ".bak_pills_auto";
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

  src = stripBlock(src, "/* VISION_PILLS_BEGIN */", "/* VISION_PILLS_END */");

  // Detect a sender function that accepts a string
  const sendFn =
    src.match(/async function (handleSend|sendMessage)\s*\(\s*([a-zA-Z0-9_]+)\s*[:)]/)?.[1] ||
    src.match(/const (handleSend|sendMessage)\s*=\s*async\s*\(\s*([a-zA-Z0-9_]+)\s*[:)]/)?.[1] ||
    null;

  // Fallback sender call if we cannot detect
  const click = sendFn ? `onClick={() => ${sendFn}(s)}` : `onClick={() => {}}`;

  // Insert helper once, near top after imports
  if (!src.includes("function buildVisionPills(")) {
    const importEnd = src.indexOf("\n\n");
    const helper = `

/* VISION_PILLS_BEGIN */
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
/* VISION_PILLS_END */
`;
    if (importEnd !== -1) {
      src = src.slice(0, importEnd) + helper + src.slice(importEnd);
    } else {
      src = helper + src;
    }
  }

  // Insert render block just above the placeholder line
  const idx = src.indexOf(needle);
  const lineStart = src.lastIndexOf("\n", idx);
  const insertPoint = lineStart === -1 ? idx : lineStart;

  const render = `
              {/* VISION_PILLS_RENDER */}
              {(() => {
                const lastA = [...messages].reverse().find((m: any) => m?.role === "assistant");
                const list = buildVisionPills(lastA?.content || "");
                return Array.isArray(list) && list.length ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {list.slice(0, 3).map((s: string, k: number) => (
                      <button
                        key={k}
                        type="button"
                        ${click}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
`;

  // Avoid double insert
  if (!src.includes("VISION_PILLS_RENDER")) {
    src = src.slice(0, insertPoint) + render + src.slice(insertPoint);
  }

  fs.writeFileSync(file, src, "utf8");
  console.log("Pills patched in:", file);
  console.log("Backup:", bak);
}

