const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_bodyfix";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

// Remove any previous body line if it exists
src = src.replace(
  /\n\s*const body = pdfBytes\.buffer\.slice\([\s\S]*?\);\n/g,
  "\n"
);

// Insert body line right after pdfBytes
src = src.replace(
  /const pdfBytes = await pdfDoc\.save\(\);\n/g,
  `const pdfBytes = await pdfDoc.save();
    const body = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    );
`
);

// Ensure NextResponse uses body
src = src.replace(
  /return new NextResponse\(\s*pdfBytes\s*,\s*\{/g,
  "return new NextResponse(body, {"
);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed:", file);
console.log("Backup:", bak);
