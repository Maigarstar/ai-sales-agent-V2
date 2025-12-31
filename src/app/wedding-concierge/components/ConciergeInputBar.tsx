"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

export default function ConciergeInputBar({
  isLightMode,
  handleSend,
}: {
  isLightMode: boolean;
  handleSend: (message: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Initialize the SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-GB";

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recog.onend = () => setIsRecording(false);
      recog.onerror = () => setIsRecording(false);

      setRecognition(recog);
    } else {
      console.warn("SpeechRecognition not supported in this browser.");
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition) return;
    if (isRecording) recognition.stop();
    else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleManualSend = () => {
    const msg = input.trim();
    if (!msg) return;
    handleSend(msg);
    setInput("");
  };

  return (
    <div
      className={`fixed bottom-20 left-0 right-0 flex w-full items-center gap-4 rounded-full border px-6 py-2 shadow-2xl backdrop-blur-xl transition-all md:max-w-3xl md:mx-auto ${
        isLightMode
          ? "bg-white/95 border-black/20"
          : "bg-[#121413]/90 border-white/10"
      }`}
    >
      {/* 🌕 Aura Orb (custom ChatGPT-inspired icon) */}
      <button
        type="button"
        onClick={toggleVoice}
        aria-label="Toggle voice input"
        className={`relative p-2 flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? "text-[#C5A059] scale-125"
            : isLightMode
            ? "text-black opacity-30"
            : "text-white opacity-40"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-6 h-6 transition-transform ${
            isRecording ? "animate-aura-pulse" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12a4 4 0 1 1 8 0 4 4 0 1 1-8 0z" />
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
        </svg>

        {isRecording && (
          <span className="absolute inset-0 rounded-full blur-md bg-[#C5A059]/30 animate-pulse" />
        )}
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleManualSend()}
        placeholder={
          isRecording ? "Listening to your desires..." : "Tell Aura your desires..."
        }
        className={`flex-1 bg-transparent py-4 text-[15px] outline-none ${
          isLightMode
            ? "text-black placeholder:text-black/40"
            : "text-white placeholder:text-white/20"
        }`}
      />

      {/* Send */}
      <button
        onClick={handleManualSend}
        className="h-10 w-10 rounded-full flex items-center justify-center bg-[#183F34] text-white transition-transform hover:scale-105"
      >
        <Send size={18} />
      </button>
    </div>
  );
}

/* Tailwind animation (add to globals.css if not already present) */
@keyframes aura-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}
.animate-aura-pulse {
  animation: aura-pulse 2s ease-in-out infinite;
}
