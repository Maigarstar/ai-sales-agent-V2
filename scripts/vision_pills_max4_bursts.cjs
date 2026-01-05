const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_pills_max4_bursts";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  src = src.replace(re, "");
}

removeBlock("/* PILLS_GATE_MAX_BEGIN */", "/* PILLS_GATE_MAX_END */");

// Ensure refs exist inside the main component
const hasRefs = src.includes("pillsBurstCountRef") && src.includes("pillsLastAssistantKeyRef");

if (!hasRefs) {
  const inputStateRe = /const\s*\[\s*input\s*,\s*setInput\s*\]\s*=\s*useState[\s\S]*?;\s*/m;
  const inputMatch = src.match(inputStateRe);

  const refBlock = `
  const pillsBurstCountRef = useRef<number>(0);
  const pillsLastAssistantKeyRef = useRef<string>("");`;

  if (inputMatch) {
    const at = src.indexOf(inputMatch[0]) + inputMatch[0].length;
    src = src.slice(0, at) + refBlock + src.slice(at);
  } else {
    // fallback, place after first useRef occurrence in the component
    const firstUseRef = src.search(/const\s+[A-Za-z0-9_]+\s*=\s*useRef/);
    if (firstUseRef !== -1) {
      const lineEnd = src.indexOf("\n", firstUseRef);
      const at = lineEnd === -1 ? firstUseRef : lineEnd + 1;
      src = src.slice(0, at) + refBlock + "\n" + src.slice(at);
    } else {
      console.error("Could not locate a safe insertion point for pill refs.");
      process.exit(1);
    }
  }
}

// Locate pills render marker
const marker = "/* VISION_PILLS_RENDER */";
const mIdx = src.indexOf(marker);
if (mIdx === -1) {
  console.error("Marker not found:", marker);
  process.exit(1);
}

const after = src.slice(mIdx);

// Find the IIFE open right after the marker
let open = "{(() => {";
let openIdxLocal = after.indexOf(open);

// Sometimes earlier patches wrapped the IIFE with an extra condition, remove that wrapper by targeting it first
const wrapped = `{messages.some((m: any) => m?.role === "user") && (() => {`;
const wrappedIdxLocal = after.indexOf(wrapped);

if (wrappedIdxLocal !== -1 && wrappedIdxLocal < 1200) {
  open = wrapped;
  openIdxLocal = wrappedIdxLocal;
}

if (openIdxLocal === -1 || openIdxLocal > 2000) {
  console.error("Could not find pills render block opening near marker.");
  process.exit(1);
}

const openIdx = mIdx + openIdxLocal;

// Remove earlier simple gate if it exists right after the open, to avoid stacking gates
const regionStart = openIdx;
const regionEnd = Math.min(src.length, openIdx + 2200);
let region = src.slice(regionStart, regionEnd);

region = region.replace(
  /const\s+userCount[\s\S]*?if\s*\(\s*userCount\s*<\s*2[\s\S]*?return\s+null;\s*/m,
  ""
);
region = region.replace(
  /const\s+userCount[\s\S]*?if\s*\(\s*!canShow\s*\)\s*return\s+null;\s*/m,
  ""
);

// Rebuild region back into src
src = src.slice(0, regionStart) + region + src.slice(regionEnd);

// Now inject the new gate immediately after the opening token
const gate = `
/* PILLS_GATE_MAX_BEGIN */
                const userCount = (messages as any[]).filter((m: any) => m?.role === "user").length;
                const lastMsg = (messages as any[])[(messages as any[]).length - 1];

                if (userCount < 2) return null;
                if (lastMsg?.role !== "assistant") return null;

                const maxBursts = 4;

                const lastAssistant = [...(messages as any[])].reverse().find((m: any) => m?.role === "assistant");
                const assistantKey =
                  String(lastAssistant?.id || "").trim() ||
                  String(lastAssistant?.created_at || "").trim() ||
                  String(lastAssistant?.content || "").slice(0, 80);

                const isNewBurst = assistantKey && pillsLastAssistantKeyRef.current !== assistantKey;

                if (isNewBurst) {
                  if (pillsBurstCountRef.current >= maxBursts) return null;
                  pillsLastAssistantKeyRef.current = assistantKey;
                  pillsBurstCountRef.current += 1;
                } else {
                  if (pillsBurstCountRef.current >= maxBursts) return null;
                }
/* PILLS_GATE_MAX_END */
`;

src =
  src.slice(0, openIdx + open.length) +
  gate +
  src.slice(openIdx + open.length);

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
