const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_pdf_buffer";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

if (!src.includes('import { Buffer } from "buffer";')) {
  src = src.replace(
    'import { NextRequest } from "next/server";',
    'import { NextRequest } from "next/server";\nimport { Buffer } from "buffer";'
  );
}

src = src.replace(
  'const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });',
  ""
);

if (src.includes("return new Response(pdfBlob, {")) {
  src = src.replace(
    "return new Response(pdfBlob, {",
    'const stableBytes = Uint8Array.from(pdfBytes as any);\n\n    return new Response(Buffer.from(stableBytes), {'
  );
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
