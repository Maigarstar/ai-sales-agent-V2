const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");

if (!fs.existsSync(target)) {
  console.error("Target file not found:", target);
  process.exit(1);
}

const original = fs.readFileSync(target, "utf8");
const backup = `${target}.bak_fix_hide_pill_${Date.now()}`;
fs.writeFileSync(backup, original, "utf8");

let content = original;

const report = {
  removedInjectedFragments: 0,
  patchedByDataAttr: 0,
  patchedByLabelSearch: 0,
};

function stripInjectedFragment(text) {
  const re =
    /display:\s*intentLocked\s*\?\s*"none"\s*:\s*undefined\s*,\s*opacity:\s*intentLocked\s*\?\s*0\s*:\s*1\s*,\s*pointerEvents:\s*intentLocked\s*\?\s*"none"\s*:\s*"auto"\s*,?\s*/g;

  const count = (text.match(re) || []).length;
  report.removedInjectedFragments += count;
  return text.replace(re, "");
}

// 1) Remove the bad injected fragment everywhere
content = stripInjectedFragment(content);

// 2) Patch the correct pill container
function patchTagAt(startIdx, endIdx) {
  const tag = content.slice(startIdx, endIdx);

  if (tag.includes('data-mode-switcher="true"') && tag.includes("intentLocked")) {
    return false;
  }

  let nextTag = tag;

  if (!nextTag.includes('data-mode-switcher="true"')) {
    nextTag = nextTag.replace("<div", '<div data-mode-switcher="true"');
  }

  if (/style=\{\{/.test(nextTag)) {
    if (!nextTag.includes("display: intentLocked")) {
      nextTag = nextTag.replace(
        /style=\{\{\s*/m,
        'style={{ display: intentLocked ? "none" : undefined, '
      );
    }
  } else if (/style=\{/.test(nextTag)) {
    // style is not an object literal, do not touch to avoid breaking
    return false;
  } else {
    nextTag = nextTag.replace(
      />$/,
      ' style={{ display: intentLocked ? "none" : undefined }}>'
    );
  }

  content = content.slice(0, startIdx) + nextTag + content.slice(endIdx);
  return true;
}

// 2a) If we already tagged the switcher before, patch that exact tag
const dataRe = /<div\b[^>]*data-mode-switcher="true"[^>]*>/m;
const dataMatch = content.match(dataRe);

if (dataMatch && typeof dataMatch.index === "number") {
  const start = dataMatch.index;
  const end = start + dataMatch[0].length;
  const ok = patchTagAt(start, end);
  if (ok) report.patchedByDataAttr += 1;
} else {
  // 2b) Find the switcher container by locating the labels and walking back to a div tag
  const idxV = content.indexOf("For Vendors");
  const idxC = content.indexOf("For Couples");

  if (idxV !== -1 && idxC !== -1 && idxC > idxV && idxC - idxV < 4000) {
    const searchBackLimit = Math.max(0, idxV - 2500);
    const backSlice = content.slice(searchBackLimit, idxV);

    // Find candidate div openings, pick the closest one with className containing max-w or shadow
    let bestStart = -1;

    for (let i = backSlice.length - 1; i >= 0; i--) {
      const absolute = searchBackLimit + i;
      if (content.slice(absolute, absolute + 4) === "<div") {
        bestStart = absolute;
        // Prefer a tag that includes className and either max-w or shadow
        const tagEnd = content.indexOf(">", bestStart);
        if (tagEnd === -1) continue;
        const tag = content.slice(bestStart, tagEnd + 1);

        const hasClass = /className\s*=/.test(tag);
        const looksLikePill = /\bmax-w-/.test(tag) || /\bshadow-/.test(tag) || /\brounded-/.test(tag);

        if (hasClass && looksLikePill) {
          const ok = patchTagAt(bestStart, tagEnd + 1);
          if (ok) {
            report.patchedByLabelSearch += 1;
            break;
          }
        }
      }
    }
  }
}

fs.writeFileSync(target, content, "utf8");

console.log("");
console.log("Fix applied, hide only the switcher pill when intent is locked.");
console.log("File:", target);
console.log("Backup:", backup);
console.log("Removed injected fragments:", report.removedInjectedFragments);
console.log("Patched by data attr:", report.patchedByDataAttr);
console.log("Patched by label search:", report.patchedByLabelSearch);
console.log("");
