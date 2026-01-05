const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_luxe_projection`;

if (!fs.existsSync(backup)) fs.writeFileSync(backup, original, "utf8");

let updated = original;

function insertAfterOnce(haystack, needle, insert) {
  const idx = haystack.indexOf(needle);
  if (idx === -1) return { text: haystack, changed: false };
  if (haystack.includes(insert.trim())) return { text: haystack, changed: false };
  const at = idx + needle.length;
  return { text: haystack.slice(0, at) + insert + haystack.slice(at), changed: true };
}

function addStyleToFirstTagAfterProjectionOpen(text) {
  const marker = "{isProjectionOpen && (";
  const idx = text.indexOf(marker);
  if (idx === -1) return { text, changed: false };

  const from = idx + marker.length;
  const lt = text.indexOf("<", from);
  if (lt === -1) return { text, changed: false };

  const gt = text.indexOf(">", lt);
  if (gt === -1) return { text, changed: false };

  const tag = text.slice(lt, gt + 1);

  if (tag.includes("PROJECTION_PANEL_STYLE")) return { text, changed: false };

  // If no style prop, add it
  if (!tag.includes("style=")) {
    const nextTag = tag.replace(/>$/, ' style={PROJECTION_PANEL_STYLE}>');
    return {
      text: text.slice(0, lt) + nextTag + text.slice(gt + 1),
      changed: true,
    };
  }

  // If style is an object literal, merge
  const merged = tag.replace(
    /style=\{\{\s*/m,
    (m) => (tag.includes("...PROJECTION_PANEL_STYLE") ? m : "style={{ ...PROJECTION_PANEL_STYLE, ")
  );

  return {
    text: text.slice(0, lt) + merged + text.slice(gt + 1),
    changed: merged !== tag,
  };
}

function addTitleStyle(text) {
  // Add style to the tag that directly contains "Projection Canvas"
  // If there is already a style prop, we do not touch it unless it is an object literal
  const re = /<([A-Za-z0-9_.]+)([^>]*)>\s*Projection Canvas\s*<\/\1>/m;
  const m = text.match(re);
  if (!m) return { text, changed: false };

  const full = m[0];
  const tagName = m[1];
  const props = m[2] || "";

  if (full.includes("PROJECTION_TITLE_STYLE")) return { text, changed: false };

  let next = full;

  if (!/style=/.test(props)) {
    next = `<${tagName}${props} style={PROJECTION_TITLE_STYLE}>Projection Canvas</${tagName}>`;
  } else if (/style=\{\{/.test(full) && !full.includes("...PROJECTION_TITLE_STYLE")) {
    next = full.replace(/style=\{\{\s*/m, "style={{ ...PROJECTION_TITLE_STYLE, ");
  } else {
    return { text, changed: false };
  }

  return { text: text.replace(full, next), changed: true };
}

function spreadCanvasStyleIntoFontSize14Objects(text) {
  // For any inline style object that already sets fontSize to 14, ensure it includes PROJECTION_CANVAS_STYLE
  // We only touch style={{ ... }} blocks, to avoid breaking variables
  const re = /style=\{\{([\s\S]*?)\}\}/g;

  let changed = false;
  const out = text.replace(re, (block, inner) => {
    const hasFont14 =
      /\bfontSize\s*:\s*14\b/.test(inner) || /\bfontSize\s*:\s*["']14px["']\b/.test(inner);

    if (!hasFont14) return block;
    if (inner.includes("PROJECTION_CANVAS_STYLE")) return block;

    // Also avoid double inserting if already has the luxe properties
    const hasLuxe =
      /\blineHeight\s*:/.test(inner) ||
      /\bletterSpacing\s*:/.test(inner) ||
      /\bWebkitFontSmoothing\s*:/.test(inner) ||
      /\bMozOsxFontSmoothing\s*:/.test(inner);

    // Always spread PROJECTION_CANVAS_STYLE first, then existing values can override if needed
    const injected = hasLuxe
      ? ` ...PROJECTION_CANVAS_STYLE, ${inner.trim()}`
      : ` ...PROJECTION_CANVAS_STYLE, ${inner.trim()}`;

    changed = true;
    return `style={{${injected}}}`;
  });

  return { text: out, changed };
}

let inserted = false;
if (!updated.includes("const PROJECTION_FONT_SIZE")) {
  const insertBlock =
`\n\nconst PROJECTION_FONT_SIZE = 14;\n\nconst PROJECTION_CANVAS_STYLE = {\n  fontFamily: "Nunito Sans, ui-sans-serif, system-ui",\n  fontSize: PROJECTION_FONT_SIZE,\n  lineHeight: 1.65,\n  letterSpacing: "0.1px",\n  WebkitFontSmoothing: "antialiased",\n  MozOsxFontSmoothing: "grayscale",\n};\n\nconst PROJECTION_PANEL_STYLE = {\n  borderRadius: 18,\n  border: "1px solid rgba(200, 161, 101, 0.22)",\n  background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",\n  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",\n};\n\nconst PROJECTION_TITLE_STYLE = {\n  fontFamily: "Gilda Display, serif",\n  fontSize: 18,\n  letterSpacing: "0.2px",\n};\n`;
  const res = insertAfterOnce(updated, "/* Smart Projection Canvas helpers */", insertBlock);
  updated = res.text;
  inserted = res.changed;
}

const panelRes = addStyleToFirstTagAfterProjectionOpen(updated);
updated = panelRes.text;

const titleRes = addTitleStyle(updated);
updated = titleRes.text;

const spreadRes = spreadCanvasStyleIntoFontSize14Objects(updated);
updated = spreadRes.text;

fs.writeFileSync(target, updated, "utf8");

console.log("");
console.log("Luxe Projection Canvas patch applied.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Inserted style constants:", inserted ? "yes" : "no");
console.log("Panel style applied:", panelRes.changed ? "yes" : "no");
console.log("Title style applied:", titleRes.changed ? "yes" : "no");
console.log("Canvas style spread into fontSize 14 blocks:", spreadRes.changed ? "yes" : "no");
console.log("");
