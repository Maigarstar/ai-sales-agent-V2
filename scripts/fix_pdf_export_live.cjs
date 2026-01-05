const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_live_fix";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const src = `import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRAND_LINE = "5 Star Weddings, The Luxury Wedding Collection";
const ASSISTANT_NAME = "Aura";
const DOMAIN = "5starweddingdirectory.com";

const ACCENT_GOLD = rgb(197 / 255, 160 / 255, 89 / 255);
const ACCENT_GREEN = rgb(31 / 255, 77 / 255, 62 / 255);
const INK = rgb(0.12, 0.12, 0.12);
const MUTED = rgb(0.45, 0.45, 0.45);
const HAIRLINE = rgb(0.9, 0.9, 0.9);

function formatStamp(d: Date) {
  const iso = d.toISOString();
  const main = iso.slice(0, 16).replace("T", ", ");
  const noDashes = main.replace(/-/g, " ");
  return noDashes.replace(/:/g, ".");
}

function cleanTopic(text: string) {
  const t = String(text || "").replace(/\\s+/g, " ").trim();
  if (!t) return "";
  return t.length > 88 ? t.slice(0, 88) + "…" : t;
}

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

export async function GET() {
  return new Response(JSON.stringify({ ok: true, version: "pdf-live-v1" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json().catch(() => ({} as any));
    const messages = Array.isArray(reqBody?.messages) ? reqBody.messages : [];

    if (!messages.length) {
      return new Response(JSON.stringify({ ok: false, error: "Missing messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 52;

    const headerH = 54;
    const footerH = 42;

    const bodySize = 11.5;
    const bodyLeading = 16;

    const maxWidth = pageWidth - marginX * 2;

    const firstUser = messages.find((m: any) => m?.role === "user")?.content || "";
    const topic = cleanTopic(firstUser);
    const stamp = formatStamp(new Date());

    const cover = pdfDoc.addPage([pageWidth, pageHeight]);

    cover.drawText(BRAND_LINE, {
      x: marginX,
      y: pageHeight - 54,
      size: 10.5,
      font,
      color: MUTED,
    });

    cover.drawRectangle({
      x: marginX,
      y: pageHeight - 70,
      width: maxWidth,
      height: 2,
      color: ACCENT_GOLD,
    });

    cover.drawText("Conversation Export", {
      x: marginX,
      y: pageHeight - 110,
      size: 26,
      font: fontBold,
      color: INK,
    });

    cover.drawText(ASSISTANT_NAME + " Concierge Transcript", {
      x: marginX,
      y: pageHeight - 136,
      size: 13,
      font,
      color: ACCENT_GREEN,
    });

    cover.drawText("Exported, " + stamp, {
      x: marginX,
      y: pageHeight - 164,
      size: 10.5,
      font,
      color: MUTED,
    });

    if (topic) {
      cover.drawText("Topic", {
        x: marginX,
        y: pageHeight - 208,
        size: 10.5,
        font: fontBold,
        color: MUTED,
      });

      const topicLines = wrapText(topic, font, 12, maxWidth);
      let ty = pageHeight - 230;

      for (const line of topicLines) {
        cover.drawText(line, { x: marginX, y: ty, size: 12, font, color: INK });
        ty -= 16;
        if (ty < 180) break;
      }
    }

    cover.drawText(DOMAIN, {
      x: marginX,
      y: 56,
      size: 10.5,
      font,
      color: MUTED,
    });

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - headerH - 24;

    const startY = () => pageHeight - headerH - 24;
    const bottomLimit = footerH + 18;

    function newPage() {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = startY();
    }

    function ensureSpace(linesNeeded: number) {
      const needed = linesNeeded * bodyLeading + 34;
      if (y - needed > bottomLimit) return;
      newPage();
    }

    for (const m of messages) {
      const role = m?.role === "user" ? "You" : ASSISTANT_NAME;
      const content = String(m?.content || "").trim();
      if (!content) continue;

      const roleLines = wrapText(role.toUpperCase(), fontBold, 9.5, maxWidth);
      const contentLines = wrapText(content, font, bodySize, maxWidth);

      ensureSpace(roleLines.length + contentLines.length + 3);

      for (const rl of roleLines) {
        page.drawText(rl, { x: marginX, y, size: 9.5, font: fontBold, color: ACCENT_GREEN });
        y -= bodyLeading - 2;
      }

      y -= 2;

      for (const cl of contentLines) {
        if (cl === "") {
          y -= 8;
          continue;
        }
        page.drawText(cl, { x: marginX, y, size: bodySize, font, color: INK });
        y -= bodyLeading;
        if (y < bottomLimit + 40) ensureSpace(3);
      }

      y -= 12;

      page.drawRectangle({ x: marginX, y, width: maxWidth, height: 1, color: HAIRLINE });
      y -= 18;
    }

    const pages = pdfDoc.getPages();
    const total = pages.length;

    for (let i = 0; i < total; i++) {
      const p = pages[i];

      if (i >= 1) {
        const headerY = pageHeight - 34;

        p.drawText(BRAND_LINE, { x: marginX, y: headerY, size: 9.5, font, color: MUTED });

        const right = ASSISTANT_NAME + (topic ? ", " + topic : "");
        const rightW = font.widthOfTextAtSize(right, 9.5);

        p.drawText(right, {
          x: Math.max(marginX, pageWidth - marginX - rightW),
          y: headerY,
          size: 9.5,
          font,
          color: MUTED,
        });

        p.drawRectangle({ x: marginX, y: pageHeight - 44, width: maxWidth, height: 1.5, color: ACCENT_GOLD });
      }

      const footerText = "Page " + (i + 1) + " of " + total;
      const footerW = font.widthOfTextAtSize(footerText, 9.5);

      p.drawRectangle({ x: marginX, y: footerH, width: maxWidth, height: 1, color: HAIRLINE });

      p.drawText(DOMAIN, { x: marginX, y: footerH - 18, size: 9.5, font, color: MUTED });
      p.drawText(footerText, { x: pageWidth - marginX - footerW, y: footerH - 18, size: 9.5, font, color: MUTED });
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="taigenic_conversation.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Export failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
`;

fs.writeFileSync(file, src, "utf8");
console.log("Updated:", file);
console.log("Backup:", bak);
