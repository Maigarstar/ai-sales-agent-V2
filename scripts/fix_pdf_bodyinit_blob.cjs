const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/api/export/pdf/route.ts");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const bak = file + ".bak_bodyinit_blob";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

let src = fs.readFileSync(file, "utf8");

if (!src.includes("const pdfBlob = new Blob([")) {
  src = src.replace(
    /const\s+pdfBytes\s*=\s*await\s+pdfDoc\.save\(\)\s*;\s*/,
    (m) => m + `const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });\n\n    `
  );
}

if (src.includes("return new Response(pdfBytes")) {
  src = src.replace(
    /return\s+new\s+Response\s*\(\s*pdfBytes\s*,\s*\{/,
    "return new Response(pdfBlob, {"
  );
}

if (src.includes("return new NextResponse(pdfBytes")) {
  src = src.replace(
    /return\s+new\s+NextResponse\s*\(\s*pdfBytes\s*,\s*\{/,
    "return new NextResponse(pdfBlob as any, {"
  );
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
