"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

interface LuxuryChatInputProps {
  onSendMessage: (text: string) => void;
  isLightMode: boolean;
  loading?: boolean;
}

export default function LuxuryChatInput({
  onSendMessage,
  isLightMode,
  loading = false,
}: LuxuryChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSendMessage(value.trim());
    setValue("");
  };

  return (
    <div
      className={`border-t px-8 py-6 ${
        isLightMode
          ? "bg-white border-black/10"
          : "bg-[#0E100F] border-white/10"
      }`}
    >
      <div className="max-w-4xl mx-auto relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tell Aura what you’re envisioning..."
          disabled={loading}
          className={`w-full rounded-full px-7 py-4 pr-16 text-[15px] outline-none transition-all shadow-xl ${
            isLightMode
              ? "bg-[#F9F9F7] text-black border border-black/10 focus:ring-2 focus:ring-[#C5A059]"
              : "bg-[#121413] text-white border border-white/10 focus:ring-2 focus:ring-[#C5A059]"
          }`}
        />

        <button
          onClick={handleSend}
          disabled={loading || !value.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:brightness-110"
          } ${
            isLightMode
              ? "bg-[#183F34] text-white"
              : "bg-[#C5A059] text-black"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
