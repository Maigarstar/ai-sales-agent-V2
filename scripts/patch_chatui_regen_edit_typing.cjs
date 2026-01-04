const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_regen_edit_typing";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

function has(s) {
  return src.includes(s);
}

function removeBlock(begin, end) {
  const re = new RegExp(begin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  src = src.replace(re, "");
}

removeBlock("/* REGEN_EDIT_BEGIN */", "/* REGEN_EDIT_END */");
removeBlock("/* REGEN_EDIT_MEMO_BEGIN */", "/* REGEN_EDIT_MEMO_END */");

const usesActiveThreadId = has("activeThreadId");
const usesOrgId = has("organisationId");
const usesAgentId = has("agentId");
const hasStartConversation = has("startConversationIfNeeded");

if (!hasStartConversation) {
  console.error("startConversationIfNeeded not found in ChatUI.tsx, patch stopped to avoid breaking your flow.");
  process.exit(1);
}

const loadingLine = /const\s*\[\s*loading\s*,\s*setLoading\s*\]\s*=\s*useState\s*\(\s*false\s*\)\s*;/;
if (loadingLine.test(src) && !has("editingUserIndex")) {
  src = src.replace(
    loadingLine,
    (m) =>
      m +
      `\n  const [editingUserIndex, setEditingUserIndex] = useState<number>(-1);\n  const [editDraft, setEditDraft] = useState<string>("");`
  );
}

const shouldShowLeadAnchor = "const shouldShowLeadCard";
if (has(shouldShowLeadAnchor) && !has("REGEN_EDIT_MEMO_BEGIN")) {
  src = src.replace(
    shouldShowLeadAnchor,
    `/* REGEN_EDIT_MEMO_BEGIN */
  const lastUserIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages as any)[i]?.role === "user") return i;
    }
    return -1;
  }, [messages]);

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages as any)[i]?.role === "assistant") return i;
    }
    return -1;
  }, [messages]);
  /* REGEN_EDIT_MEMO_END */

  ${shouldShowLeadAnchor}`
  );
}

const keydownAnchor = "function handleKeyDown";
if (has(keydownAnchor) && !has("REGEN_EDIT_BEGIN")) {
  const threadLine = usesActiveThreadId ? `threadId: activeThreadId || null,` : ``;
  const orgLine = usesOrgId ? `organisationId,` : ``;
  const agentLine = usesAgentId ? `agentId,` : ``;

  const helpers = `
  /* REGEN_EDIT_BEGIN */
  function beginEdit(index: number) {
    const m = (messages as any)[index];
    if (!m || m.role !== "user") return;
    setEditingUserIndex(index);
    setEditDraft(String(m.content || ""));
  }

  function cancelEdit() {
    setEditingUserIndex(-1);
    setEditDraft("");
  }

  async function runChatFrom(messagesForRun: any[], opts?: { regenerate?: boolean }) {
    const chatType = intent === "vendor" ? "vendor" : "couple";

    setLoading(true);

    try {
      const id = await startConversationIfNeeded();

      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForRun,
          chatType,
          conversationId: id,
          ${orgLine}
          ${agentLine}
          ${threadLine}
          regenerate: !!opts?.regenerate,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const reply = String(data?.reply || "").trim();

      if (reply) {
        setMessages((prev: any) => [...messagesForRun, { role: "assistant", content: reply }]);
      } else {
        setMessages((prev: any) => [...messagesForRun, { role: "assistant", content: "I’m here. Say that again and I’ll answer properly." }]);
      }
    } catch {
      setMessages((prev: any) =>
        [...messagesForRun, { role: "assistant", content: "Network issue. Try again, and I’ll pick up where we left off." }]
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(index: number) {
    const nextText = String(editDraft || "").trim();
    if (!nextText) return;

    const updated = (messages as any).map((m: any, i: number) =>
      i === index ? { ...m, content: nextText } : m
    );

    const truncated = updated.slice(0, index + 1);

    setMessages(truncated);
    setEditingUserIndex(-1);
    setEditDraft("");

    await runChatFrom(truncated, { regenerate: true });
  }

  async function handleRegenerate() {
    if (loading) return;

    const la = lastAssistantIndex;
    if (la < 0) return;

    const trimmed = (messages as any).slice(0, la);

    if (trimmed.length === 0) return;

    setMessages(trimmed);

    await runChatFrom(trimmed, { regenerate: true });
  }
  /* REGEN_EDIT_END */
`;

  src = src.replace(
    keydownAnchor,
    helpers + "\n  " + keydownAnchor
  );
}

const contentExact1 = `{m.role === "user" ? m.content : <FormattedMessage content={m.content} />}`;
const contentExact2 = `{m.role === "user" ? m.content : <FormattedMessage content={m.content} /> }`;
const replacement = `{m.role === "user" ? (
                      <div className="space-y-2">
                        {editingUserIndex === i ? (
                          <div className="space-y-2">
                            <textarea
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEdit(i)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-[#1F4D3E] text-white hover:bg-[#163C30]"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}

                        {i === lastUserIndex && !loading && editingUserIndex !== i ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => beginEdit(i)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FormattedMessage content={m.content} />
                        {i === lastAssistantIndex && !loading ? (
                          <div className="flex">
                            <button
                              type="button"
                              onClick={handleRegenerate}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                            >
                              Regenerate
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}`;

if (!has("handleRegenerate") && (has(contentExact1) || has(contentExact2))) {
  src = src.replace(contentExact1, replacement);
  src = src.replace(contentExact2, replacement);
} else if (has(contentExact1) || has(contentExact2)) {
  src = src.replace(contentExact1, replacement);
  src = src.replace(contentExact2, replacement);
}

if (!has("Aura is typing") && has("animate-bounce")) {
  src = src.replace(
    /(<div className="bg-white[^"]*?flex[^"]*?items-center[^"]*?">)/,
    `$1\n                    <div className="text-xs text-gray-500 mr-2">Aura is typing</div>`
  );
}

fs.writeFileSync(file, src, "utf8");
console.log("Patched:", file);
console.log("Backup:", bak);
