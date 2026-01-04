const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_autotitle_timing";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

src = src.replace(
  /\n\s*\/\*\s*AUTO_THREAD_TITLE_CALL\s*\*\/[\s\S]*?\/\*\s*AUTO_THREAD_TITLE_CALL_END\s*\*\/\s*\n/g,
  "\n"
);

const pattern =
  /if\s*\(serverMode\s*&&\s*!activeThreadId\)\s*\{[\s\S]*?\}\s*\n\s*\n\s*const id = await startConversationIfNeeded\(\);\n/;

if (!pattern.test(src)) {
  console.error("Could not find the thread creation block to replace.");
  process.exit(1);
}

const replacement = `
    const shouldAutoTitle = serverMode && messages.every((m) => m.role !== "user");
    let threadForTitle = activeThreadId;

    if (serverMode && !activeThreadId) {
      const newId = await createThread("couple");
      if (newId) {
        setActiveThreadId(newId);
        threadForTitle = newId;
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_THREAD, newId);
        } catch {}
        await refreshThreads(newId);
      }
    }

    if (shouldAutoTitle && threadForTitle) {
      const title = makeThreadTitleFromText(text);
      void setThreadTitle(threadForTitle, title);
    }

    const id = await startConversationIfNeeded();
`;

src = src.replace(pattern, replacement);

fs.writeFileSync(file, src, "utf8");
console.log("Fixed auto title timing in:", file);
console.log("Backup saved as:", bak);
