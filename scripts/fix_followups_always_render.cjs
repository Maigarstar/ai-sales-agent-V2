const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/app/_public/aura-chat/ChatUI.tsx");
if (!fs.existsSync(file)) {
  console.error("ChatUI.tsx not found:", file);
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const bak = file + ".bak_followups_render_fix";
if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);

const marker = "/* FOLLOWUPS_RENDER */";
const start = src.indexOf(marker);

if (start === -1) {
  console.error("FOLLOWUPS_RENDER marker not found, nothing to patch.");
  process.exit(1);
}

// Find the end of the current followups block by locating the next occurrence of lastAssistantIndex render block or the regenerate button block
const regenNeedle = "{i === lastAssistantIndex && !loading ? (";
const afterStart = src.indexOf(regenNeedle, start);
if (afterStart === -1) {
  console.error("Could not locate regenerate block after followups marker.");
  process.exit(1);
}

// Replace only the followups block between marker and the regenerate needle
const newFollowups = `
                        {/* FOLLOWUPS_RENDER */}
                        {i === lastAssistantIndex && !loading ? (
                          (() => {
                            const sugs = (m as any).suggestions;
                            const list =
                              Array.isArray(sugs) && sugs.length
                                ? sugs
                                : (typeof buildFollowUps === "function"
                                    ? buildFollowUps(String((m as any).content || ""), intent)
                                    : []);

                            return Array.isArray(list) && list.length ? (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {list.slice(0, 3).map((s: string, k: number) => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => handleSend(s)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()
                        ) : null}
`;

const before = src.slice(0, start);
const after = src.slice(afterStart);

src = before + newFollowups + "\n" + after;

fs.writeFileSync(file, src, "utf8");
console.log("Patched followups render in:", file);
console.log("Backup saved as:", bak);
