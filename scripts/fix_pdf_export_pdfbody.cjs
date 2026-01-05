const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_pdfbody";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// Remove any previous pdfBytes.buffer.slice blocks (body or pdfBody)
src = src.replace(
  /const\s+(?:body|pdfBody)\s*=\s*pdfBytes\.buffer\.slice\([\s\S]*?\);\s*/g,
  ""
);

// Insert one clean pdfBody block right after pdfBytes save line
src = src.replace(
  /const pdfBytes = await pdfDoc\.save\(\);\s*/g,
  `const pdfBytes = await pdfDoc.save();

    const pdfBody = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    );

`
);

// Ensure NextResponse uses pdfBody
src = src.replace(/return new NextResponse\(\s*pdfBytes\s*,\s*\{/g, "return new NextResponse(pdfBody, {");
src = src.replace(/return new NextResponse\(\s*body\s*,\s*\{/g, "return new NextResponse(pdfBody, {");

fs.writeFileSync(file, src, "utf8");
console.log("Fixed:", file);
console.log("Backup:", bak);
