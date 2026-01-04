const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_fix_missing_chattype";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const fetchAnchor = 'const res = await fetch("/api/vendors-chat",';

if (!src.includes(fetchAnchor)) {
  console.error("Fetch anchor not found, cannot patch safely.");
  process.exit(1);
}

const alreadyHasChatType =
  src.includes("const chatType =") &&
  src.indexOf("const chatType =") < src.indexOf(fetchAnchor);

if (!alreadyHasChatType) {
  src = src.replace(
    fetchAnchor,
    `const chatType = intent === "vendor" ? "vendor" : "couple";\n\n      ${fetchAnchor}`
  );
}

fs.writeFileSync(file, src, "utf8");
console.log("Inserted chatType before vendors chat fetch in:", file);
console.log("Backup saved as:", bak);
