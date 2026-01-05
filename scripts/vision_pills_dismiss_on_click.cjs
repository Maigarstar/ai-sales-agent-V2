const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_pills_dismiss_on_click";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  src = src.replace(re, "");
}

removeBlock("/* PILLS_DISMISS_CLICK_BEGIN */", "/* PILLS_DISMISS_CLICK_END */");

// 1) Add dismiss state and reset logic inside the main component
// We attach after messages state so messages is in scope for the useEffect
const messagesStateRe = /const\s*\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState[\s\S]*?;\s*/m;
const msgMatch = src.match(messagesStateRe);

if (!msgMatch) {
  console.error("Could not find messages state in VisionWorkspace.tsx");
  process.exit(1);
}

const insertAt = src.indexOf(msgMatch[0]) + msgMatch[0].length;

const dismissBlock = `
  /* PILLS_DISMISS_CLICK_BEGIN */
  const [pillsForceHidden, setPillsForceHidden] = useState(false);
  const lastAssistantKeyForPillsRef = useRef<string>("");

  function dismissPillsNow() {
    setPillsForceHidden(true);
  }

  useEffect(() => {
    const lastAssistant = [...(messages as any[])].reverse().find((m: any) => m?.role === "assistant");
    const key =
      String(lastAssistant?.id || "").trim() ||
      String(lastAssistant?.created_at || "").trim() ||
      String(lastAssistant?.content || "").slice(0, 80);

    if (key && key !== lastAssistantKeyForPillsRef.current) {
      lastAssistantKeyForPillsRef.current = key;
      setPillsForceHidden(false);
    }
  }, [messages]);
  /* PILLS_DISMISS_CLICK_END */
`;

src = src.slice(0, insertAt) + dismissBlock + src.slice(insertAt);

// 2) Make pills gate respect pillsForceHidden
src = src.replace(
  /const\s+canShow\s*=\s*userCount\s*>=\s*2\s*&&\s*last\?\.\s*role\s*===\s*"assistant"\s*&&\s*!loading\s*&&\s*!typing\s*;/,
  'const canShow = userCount >= 2 && last?.role === "assistant" && !loading && !typing && !pillsForceHidden;'
);

// 3) Clicking the chat area hides pills
// Add onMouseDown to the main scroll area, first occurrence of ref={scrollRef}
if (src.includes('ref={scrollRef}') && !src.includes('onMouseDown={dismissPillsNow}')) {
  src = src.replace('ref={scrollRef}', 'ref={scrollRef} onMouseDown={dismissPillsNow}');
}

// 4) Focusing input hides pills
// Add onFocus to the textarea that binds to input
const textareaRe = /<textarea([\s\S]*?)value=\{input\}([\s\S]*?)>/m;
const tMatch = src.match(textareaRe);

if (tMatch && !tMatch[0].includes("onFocus={dismissPillsNow}")) {
  const patched = tMatch[0].replace("value={input}", "value={input}\n                onFocus={dismissPillsNow}");
  src = src.replace(tMatch[0], patched);
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
