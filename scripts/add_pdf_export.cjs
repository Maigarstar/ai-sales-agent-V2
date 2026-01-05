const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(src, begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  return src.replace(re, "");
}

function ensureLucideImportHas(src, name) {
  const re = /import\s*\{\s*([\s\S]*?)\s*\}\s*from\s*"lucide-react";/m;
  const m = src.match(re);
  if (!m) return src;

  const inside = m[1];
  if (inside.includes(name)) return src;

  const nextInside = inside.trim().endsWith(",")
    ? inside.trim() + " " + name
    : inside.trim() + ", " + name;

  return src.replace(re, `import { ${nextInside} } from "lucide-react";`);
}

function insertAfter(src, anchor, block) {
  const idx = src.indexOf(anchor);
  if (idx === -1) return src;
  return src.slice(0, idx + anchor.length) + block + src.slice(idx + anchor.length);
}

function insertAfterFirst(src, needle, block) {
  const idx = src.indexOf(needle);
  if (idx === -1) return src;
  const end = idx + needle.length;
  return src.slice(0, end) + block + src.slice(end);
}

function insertButtonAfterShare(src) {
  const shareIdx = src.indexOf('title="Share"');
  if (shareIdx === -1) return src;

  const closeBtnIdx = src.indexOf("</button>", shareIdx);
  if (closeBtnIdx === -1) return src;

  const after = closeBtnIdx + "</button>".length;

  if (src.includes('title="Export PDF"')) return src;

  const btn = `
              <button
                onClick={handleExportPdf}
                disabled={pdfBusy}
                className="rounded-full p-2 transition-all text-gray-400 hover:text-[#1F4D3E] hover:bg-green-50 disabled:opacity-50"
                title="Export PDF"
                type="button"
              >
                <FileDown size={18} />
              </button>`;

  return src.slice(0, after) + "\n" + btn + src.slice(after);
}

/* ================================
   1) API ROUTE
================================== */
const apiFile = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");

const apiSrc = `import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const paras = String(text || "").split(/\\n+/g);
  const lines: string[] = [];

  for (const para of paras) {
    const words = para.split(/\\s+/g).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      const width = font.widthOfTextAtSize(test, size);
      if (width <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    lines.push("");
  }

  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const threadId = String(body?.threadId || "").trim();

    if (!threadId) {
      return NextResponse.json({ ok: false, error: "Missing threadId" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;

    const mRes = await fetch(\`\${origin}/api/threads/\${threadId}/messages\`, {
      method: "GET",
      cache: "no-store",
    });

    if (!mRes.ok) {
      return NextResponse.json({ ok: false, error: "Messages fetch failed" }, { status: 500 });
    }

    const mData = await mRes.json().catch(() => ({} as any));
    const messages = Array.isArray(mData?.messages) ? mData.messages : [];

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const marginX = 48;
    const marginY = 54;

    const titleSize = 16;
    const subSize = 10;
    const bodySize = 11;
    const lineHeight = 15;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - marginY;

    const maxWidth = pageWidth - marginX * 2;

    const now = new Date();
    const stamp = now.toISOString().slice(0, 19).replace("T", " ");

    page.drawText("Taigenic Conversation", { x: marginX, y, size: titleSize, font: fontBold });
    y -= 20;
    page.drawText(\`Exported: \${stamp}\`, { x: marginX, y, size: subSize, font });
    y -= 22;

    const firstUser = messages.find((m: any) => m?.role === "user")?.content || "";
    const safeTitle = String(firstUser).replace(/\\s+/g, " ").trim().slice(0, 80);
    if (safeTitle) {
      page.drawText(\`Topic: \${safeTitle}\`, { x: marginX, y, size: subSize, font });
      y -= 18;
    }

    y -= 8;

    function ensureSpace(linesNeeded = 1) {
      const needed = linesNeeded * lineHeight + 24;
      if (y - needed > marginY) return;
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - marginY;
    }

    for (const m of messages) {
      const role = m?.role === "user" ? "You" : "Aura";
      const content = String(m?.content || "").trim();
      if (!content) continue;

      const roleLine = role.toUpperCase();
      const roleLines = wrapText(roleLine, fontBold, subSize, maxWidth);
      const contentLines = wrapText(content, font, bodySize, maxWidth);

      ensureSpace(roleLines.length + contentLines.length + 2);

      for (const rl of roleLines) {
        page.drawText(rl, { x: marginX, y, size: subSize, font: fontBold });
        y -= lineHeight;
      }

      y -= 2;

      for (const cl of contentLines) {
        if (cl === "") {
          y -= 6;
          continue;
        }
        page.drawText(cl, { x: marginX, y, size: bodySize, font });
        y -= lineHeight;
        if (y < marginY + 30) ensureSpace(2);
      }

      y -= 14;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="taigenic-conversation.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Export failed" }, { status: 500 });
  }
}
`;

writeFile(apiFile, apiSrc);

/* ================================
   2) PATCH VISION WORKSPACE
================================== */
const visionFile = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(visionFile)) {
  console.log("PDF route created. VisionWorkspace not found, skipping UI patch.");
  process.exit(0);
}

let v = fs.readFileSync(visionFile, "utf8");
const bak = visionFile + ".bak_pdf_export";
if (!fs.existsSync(bak)) fs.copyFileSync(visionFile, bak);

v = removeBlock(v, "/* EXPORT_PDF_BEGIN */", "/* EXPORT_PDF_END */");
v = ensureLucideImportHas(v, "FileDown");

/* Add handler and state */
const exportBlock = `
  /* EXPORT_PDF_BEGIN */
  const [pdfBusy, setPdfBusy] = useState(false);

  async function handleExportPdf() {
    if (pdfBusy) return;

    const threadId = String((typeof activeThreadId !== "undefined" ? activeThreadId : "") || "").trim();
    if (!threadId) return;

    setPdfBusy(true);

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "taigenic-conversation.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  }
  /* EXPORT_PDF_END */
`;

if (v.includes("/* SHARE_LINK_END */")) {
  v = insertAfter(v, "/* SHARE_LINK_END */", exportBlock);
} else if (v.includes('const [activeThreadId, setActiveThreadId]')) {
  v = insertAfterFirst(v, 'const [activeThreadId, setActiveThreadId]', "");
  v = insertAfter(v, 'const [activeThreadId, setActiveThreadId]', "");
  v = insertAfter(v, 'useState<string>("");', exportBlock);
} else {
  // last resort, add near top of component
  const compIdx = v.indexOf("export default function");
  if (compIdx !== -1) {
    const braceIdx = v.indexOf("{", compIdx);
    if (braceIdx !== -1) {
      v = v.slice(0, braceIdx + 1) + "\n" + exportBlock + v.slice(braceIdx + 1);
    }
  }
}

/* Add button after Share button */
v = insertButtonAfterShare(v);

fs.writeFileSync(visionFile, v, "utf8");

console.log("PDF export installed.");
console.log("API:", apiFile);
console.log("UI:", visionFile);
console.log("Backup:", bak);
