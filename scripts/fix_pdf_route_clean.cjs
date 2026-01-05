const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_clean_pdf";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const clean = `import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Buffer } from "buffer";

export const runtime = "nodejs";

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
    const reqBody = await req.json().catch(() => ({} as any));
    const threadId = String(reqBody?.threadId || "").trim();

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

      const roleLines = wrapText(role.toUpperCase(), fontBold, subSize, maxWidth);
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
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="taigenic_conversation.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Export failed" }, { status: 500 });
  }
}
`;

fs.writeFileSync(file, clean, "utf8");
console.log("Rewrote:", file);
console.log("Backup:", bak);
