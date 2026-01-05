const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileIfChanged(file, content) {
  ensureDir(path.dirname(file));
  if (fs.existsSync(file)) {
    const prev = fs.readFileSync(file, "utf8");
    if (prev === content) return false;
  }
  fs.writeFileSync(file, content, "utf8");
  return true;
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeBlock(src, begin, end) {
  const re = new RegExp(escRe(begin) + "[\\s\\S]*?" + escRe(end), "g");
  return src.replace(re, "");
}

const apiShareRoute = path.join(process.cwd(), "src/app/api/share/route.ts");
const apiShareTokenRoute = path.join(process.cwd(), "src/app/api/share/[token]/route.ts");
const sharePage = path.join(process.cwd(), "src/app/share/[token]/page.tsx");
const shareClient = path.join(process.cwd(), "src/app/share/[token]/ShareConversationClient.tsx");

const shareRouteSrc = `import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();

  const body = await req.json().catch(() => ({} as any));
  const threadId = String(body?.threadId || "").trim();

  if (!threadId) {
    return NextResponse.json({ ok: false, error: "Missing threadId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("thread_shares")
    .insert({ thread_id: threadId })
    .select("token")
    .single();

  if (error || !data?.token) {
    return NextResponse.json({ ok: false, error: error?.message || "Share create failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    token: data.token,
    path: \`/share/\${data.token}\`,
  });
}
`;

const shareTokenRouteSrc = `import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;

  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("thread_shares")
    .select("thread_id, revoked, expires_at")
    .eq("token", token)
    .single();

  if (error || !data?.thread_id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (data.revoked) {
    return NextResponse.json({ ok: false, error: "Revoked" }, { status: 410 });
  }

  if (data.expires_at) {
    const exp = new Date(String(data.expires_at)).getTime();
    if (!Number.isNaN(exp) && exp <= Date.now()) {
      return NextResponse.json({ ok: false, error: "Expired" }, { status: 410 });
    }
  }

  const origin = new URL(req.url).origin;

  const mRes = await fetch(\`\${origin}/api/threads/\${data.thread_id}/messages\`, {
    method: "GET",
    cache: "no-store",
  });

  if (!mRes.ok) {
    return NextResponse.json({ ok: false, error: "Messages fetch failed" }, { status: 500 });
  }

  const mData = await mRes.json().catch(() => ({} as any));
  const messages = Array.isArray(mData?.messages) ? mData.messages : [];

  return NextResponse.json({
    ok: true,
    threadId: data.thread_id,
    messages,
  });
}
`;

const sharePageSrc = `import ShareConversationClient from "./ShareConversationClient";

export default function SharePage({ params }: { params: { token: string } }) {
  return <ShareConversationClient token={params.token} />;
}
`;

const shareClientSrc = `"use client";

import React, { useEffect, useMemo, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ShareConversationClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(\`/api/share/\${token}\`, { method: "GET" });
        const data = await res.json().catch(() => ({} as any));

        if (!res.ok || !data?.ok) {
          setError(String(data?.error || "This link is not available."));
          setMessages([]);
          return;
        }

        const list = Array.isArray(data?.messages) ? data.messages : [];
        const mapped = list
          .map((m: any) => ({
            role: m?.role === "user" ? "user" : "assistant",
            content: String(m?.content || ""),
          }))
          .filter((m: any) => m.content.trim().length > 0);

        setMessages(mapped);
      } catch {
        setError("This link is not available.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const title = useMemo(() => {
    const firstUser = messages.find((m) => m.role === "user")?.content || "";
    const clean = firstUser.replace(/\\s+/g, " ").trim();
    return clean ? clean.slice(0, 60) : "Shared conversation";
  }, [messages]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-neutral-400">Taigenic</div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <div className="text-xs text-neutral-500 mt-2">Read only view</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm hover:bg-neutral-800"
            >
              Copy link
            </button>
            <a
              href="/vision"
              className="px-3 py-2 rounded-xl bg-neutral-100 text-neutral-900 text-sm hover:opacity-90"
            >
              Open Vision
            </a>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="text-neutral-400">Loading</div>
          ) : error ? (
            <div className="text-neutral-300">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-neutral-400">No messages</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={\`flex \${m.role === "user" ? "justify-end" : "justify-start"}\`}>
                <div
                  className={\`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed border \${m.role === "user"
                    ? "bg-neutral-100 text-neutral-900 border-neutral-200"
                    : "bg-neutral-900 text-neutral-100 border-neutral-800"}\`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`;

let changed = 0;
if (writeFileIfChanged(apiShareRoute, shareRouteSrc)) changed += 1;
if (writeFileIfChanged(apiShareTokenRoute, shareTokenRouteSrc)) changed += 1;
if (writeFileIfChanged(sharePage, sharePageSrc)) changed += 1;
if (writeFileIfChanged(shareClient, shareClientSrc)) changed += 1;

// Patch VisionWorkspace to add a Share button that copies the share link
const visionFile = path.join(process.cwd(), "src/app/vision/VisionWorkspace.tsx");
if (fs.existsSync(visionFile)) {
  let v = fs.readFileSync(visionFile, "utf8");
  const bak = visionFile + ".bak_share_link";
  if (!fs.existsSync(bak)) fs.copyFileSync(visionFile, bak);

  v = removeBlock(v, "/* SHARE_LINK_BEGIN */", "/* SHARE_LINK_END */");

  // Ensure Share2 icon import if lucide import exists
  v = v.replace(
    /from\s+"lucide-react";/g,
    (m) => m
  );

  if (v.includes('from "lucide-react"')) {
    v = v.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*"lucide-react";/m,
      (full, inner) => {
        if (inner.includes("Share2")) return full;
        return `import { ${inner.trim()}, Share2 } from "lucide-react";`;
      }
    );
  }

  // Insert state and handler after loading state if present, else after first useState occurrence
  const loadingRe = /const\s*\[\s*loading\s*,\s*setLoading\s*\]\s*=\s*useState\s*\(\s*false\s*\)\s*;\s*/m;
  const insertAfter = v.match(loadingRe)?.[0];

  const shareBlock = `
  /* SHARE_LINK_BEGIN */
  const [shareNote, setShareNote] = useState<string>("");
  const [shareBusy, setShareBusy] = useState(false);

  async function handleShareLink() {
    if (shareBusy) return;

    const threadId = String((typeof activeThreadId !== "undefined" ? activeThreadId : "") || "").trim();
    if (!threadId) {
      setShareNote("Send two messages first, then share.");
      setTimeout(() => setShareNote(""), 1600);
      return;
    }

    setShareBusy(true);
    setShareNote("");

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });

      const data = await res.json().catch(() => ({} as any));
      const pathPart = String(data?.path || "").trim();

      if (!res.ok || !data?.ok || !pathPart) {
        setShareNote("Share failed.");
        setTimeout(() => setShareNote(""), 1600);
        return;
      }

      const full = window.location.origin + pathPart;
      await navigator.clipboard.writeText(full);

      setShareNote("Link copied.");
      setTimeout(() => setShareNote(""), 1600);
    } catch {
      setShareNote("Share failed.");
      setTimeout(() => setShareNote(""), 1600);
    } finally {
      setShareBusy(false);
    }
  }
  /* SHARE_LINK_END */
`;

  if (insertAfter) {
    v = v.replace(insertAfter, insertAfter + shareBlock);
  } else if (!v.includes("handleShareLink")) {
    const firstUseState = v.search(/useState\s*\(/);
    if (firstUseState !== -1) {
      const lineEnd = v.indexOf("\n", firstUseState);
      v = v.slice(0, lineEnd + 1) + shareBlock + v.slice(lineEnd + 1);
    }
  }

  // Add Share button next to End chat button, by injecting before the first handleEndChat click
  if (!v.includes("handleShareLink(")) {
    // handler block did not insert, skip UI insert
  } else {
    const endChatClickRe = /onClick=\{handleEndChat\}/m;
    if (endChatClickRe.test(v) && !v.includes("onClick={handleShareLink}")) {
      v = v.replace(
        endChatClickRe,
        `onClick={handleEndChat}`
      );

      v = v.replace(
        /(<button[^>]*?)onClick=\{handleEndChat\}([\s\S]*?<\/button>)/m,
        (full, start, rest) => {
          const shareBtn = `<button
                onClick={handleShareLink}
                className="rounded-full p-2 transition-all text-gray-400 hover:text-[#1F4D3E] hover:bg-green-50"
                title="Share"
                type="button"
              >
                <Share2 size={18} />
              </button>`;
          return `${shareBtn}\n${start}onClick={handleEndChat}${rest}`;
        }
      );
    }
  }

  // If there is a place to show note, inject near input tray if possible
  if (v.includes("shareNote") && !v.includes("{shareNote ?")) {
    v = v.replace(
      /(placeholder=\{`Message[^`]*`\}[\s\S]*?\/>)/m,
      `$1\n              {shareNote ? (\n                <div className="mt-2 text-xs text-gray-500">{shareNote}</div>\n              ) : null}`
    );
  }

  fs.writeFileSync(visionFile, v, "utf8");
  changed += 1;
}

console.log("Share link added. Files changed:", changed);
