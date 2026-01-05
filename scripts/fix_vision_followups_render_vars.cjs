const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("VisionWorkspace.tsx not found:", file);
  process.exit(1);
}

const bak = file + ".bak_followups_render_vars";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

const MARK = "/* VISION_FOLLOWUPS_RENDER */";
const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.error("VISION_FOLLOWUPS_RENDER marker not found.");
  process.exit(1);
}

/* Find nearest .map((x, y) => ...) above the marker to learn real variable names */
const lookback = src.slice(Math.max(0, markIdx - 6000), markIdx);

let msgVar = "m";
let idxVar = "i";

/* Prefer messages.map((msg, i) => */
const mapRe = /\.map\(\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,\s*([A-Za-z_$][A-Za-z0-9_$]*))?\s*\)\s*=>/g;
let last = null;
for (const m of lookback.matchAll(mapRe)) last = m;

if (last) {
  msgVar = last[1] || msgVar;
  idxVar = last[2] || idxVar;
}

const after = src.slice(markIdx);

/* Locate the injected conditional after the marker */
const condStartRel = after.indexOf("{", after.indexOf(MARK));
if (condStartRel === -1) {
  console.error("Could not find conditional start after marker.");
  process.exit(1);
}

const condStartAbs = markIdx + condStartRel;

/* Find the end of the conditional, we look for the first ': null}' after the start */
const tail = src.slice(condStartAbs);
const endRel = tail.search(/:\s*null\s*\}/);
if (endRel === -1) {
  console.error("Could not find end of followups conditional.");
  process.exit(1);
}

const condEndAbs = condStartAbs + endRel;

/* Advance to include the closing brace of the conditional */
const closeBraceAbs = src.indexOf("}", condEndAbs);
if (closeBraceAbs === -1) {
  console.error("Could not find closing brace of conditional.");
  process.exit(1);
}

const replacement =
`{${msgVar}.role === "assistant" && ${idxVar} === visionLastAssistantIndex && showVisionFollowups ? (
                      <div data-vision-followups="1" className="mt-3 flex flex-wrap gap-2">
                        {visionFollowupsState.slice(0, 4).map((t, k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => onVisionFollowupClick(t)}
                            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-700"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : null}`;

/* Replace only the conditional expression, keep the marker comment */
src = src.slice(0, condStartAbs) + replacement + src.slice(closeBraceAbs + 1);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed followups render vars using:", msgVar, idxVar);
console.log("File:", file);
console.log("Backup:", bak);
