"use client";

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
        const res = await fetch(`/api/share/${token}`, { method: "GET" });
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
    const clean = firstUser.replace(/\s+/g, " ").trim();
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
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed border ${m.role === "user"
                    ? "bg-neutral-100 text-neutral-900 border-neutral-200"
                    : "bg-neutral-900 text-neutral-100 border-neutral-800"}`}
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
