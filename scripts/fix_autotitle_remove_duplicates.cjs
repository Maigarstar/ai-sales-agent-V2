const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_autotitle_dupes";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const needle = 'const shouldAutoTitle = serverMode && messages.every((m) => m.role !== "user");';
let idxs = [];
let pos = 0;

while (true) {
  const i = src.indexOf(needle, pos);
  if (i === -1) break;
  idxs.push(i);
  pos = i + needle.length;
}

if (idxs.length <= 1) {
  console.log("No duplicate shouldAutoTitle blocks found.");
  console.log("Backup saved as:", bak);
  process.exit(0);
}

// Keep the first, remove the rest
for (let k = idxs.length - 1; k >= 1; k--) {
  const start = idxs[k];

  // remove from the start of the line
  const lineStart = src.lastIndexOf("\n", start) + 1;

  // find the next occurrence of the id assignment, and remove through its line
  const idNeedle = "const id = await startConversationIfNeeded();";
  const idPos = src.indexOf(idNeedle, start);

  let end;
  if (idPos !== -1) {
    const lineEnd = src.indexOf("\n", idPos);
    end = lineEnd === -1 ? src.length : lineEnd + 1;
  } else {
    // fallback, remove just this line
    const lineEnd = src.indexOf("\n", start);
    end = lineEnd === -1 ? src.length : lineEnd + 1;
  }

  src = src.slice(0, lineStart) + src.slice(end);
}

fs.writeFileSync(file, src, "utf8");
console.log("Removed duplicate shouldAutoTitle blocks in:", file);
console.log("Backup saved as:", bak);
