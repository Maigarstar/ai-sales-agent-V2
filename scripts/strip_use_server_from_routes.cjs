const fs = require("fs");
const path = require("path");

const targets = [
  "src/app/api/threads/[id]/title/route.ts",
  "src/app/api/followups/route.ts",
];

function stripUseServer(src) {
  // remove any "use server" directive lines
  return src
    .replace(/^\s*["']use server["']\s*;\s*\n/gm, "")
    .replace(/^\s*["']use server["']\s*\n/gm, "");
}

for (const rel of targets) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    console.log("Skip, not found:", rel);
    continue;
  }

  const bak = file + ".bak_strip_use_server";
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

  const src = fs.readFileSync(file, "utf8");
  const next = stripUseServer(src);

  fs.writeFileSync(file, next, "utf8");
  console.log("Stripped use server:", rel);
  console.log("Backup:", bak);
}
