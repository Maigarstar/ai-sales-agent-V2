"use client";

import { useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function BaseChat({
  messages,
  input,
  setInput,
  onSend,
}: {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-grow textarea (ChatGPT style)
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }, [input]);

  return (
    <div className="flex h-full flex-col bg-white">

  {/* Top Brand Bar */}
<div className="sticky top-0 z-10 w-full border-b border-neutral-100 bg-white">
  <div className="py-3 text-center text-sm font-semibold tracking-wide text-[#183F34]">
    5 STAR WEDDINGS
  </div>
</div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mx-auto w-full max-w-[760px] py-8 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-6 py-4 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#183F34] text-white"
                    : "bg-[#F2F4F3] text-[#112620]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Sticky Input */}
      <div className="sticky bottom-0 bg-white px-4 py-4">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="flex items-end gap-3 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-lg">

            {/* Upload */}
            <button
              type="button"
              aria-label="Upload"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            >
              +
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message Aura, your Wedding Concierge…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none"
            />

            {/* Sound (not mic) */}
            <button
              type="button"
              aria-label="Sound"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            >
              🔊
            </button>

            {/* Send */}
            <button
              onClick={onSend}
              disabled={!input.trim()}
              aria-label="Send"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                input.trim()
                  ? "bg-[#183F34] text-white hover:opacity-90"
                  : "bg-neutral-200 text-neutral-400"
              }`}
            >
              ↑
            </button>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <div>
              5 Star Weddings, The Luxury Wedding Collection ·{" "}
              <a href="/cookie-preferences" className="underline">
                Cookie Preferences
              </a>
            </div>
            <div className="whitespace-nowrap">
              Powered by <span className="font-medium">Taigenic.ai</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}