"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

type Props = {
  isLightMode: boolean;
  handleSend: (message: string) => void;
};

export default function ConciergeInputBar({ isLightMode, handleSend }: Props) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialise SpeechRecognition safely
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) setInput(transcript);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const sendNow = () => {
    const msg = input.trim();
    if (!msg) return;
    handleSend(msg);
    setInput("");
  };

  return (
    <div
      className={`fixed bottom-20 left-0 right-0 z-40 mx-auto flex w-full max-w-3xl items-center gap-4 rounded-full border px-6 py-2 shadow-2xl backdrop-blur-xl transition ${
        isLightMode
          ? "bg-white/95 border-black/20"
          : "bg-[#121413]/90 border-white/10"
      }`}
    >
      {/* Voice Orb */}
      <button
        type="button"
        onClick={toggleVoice}
        aria-label="Toggle voice input"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
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
          className={`h-6 w-6 ${isRecording ? "animate-aura-pulse" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12a4 4 0 1 1 8 0a4 4 0 1 1-8 0" />
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
        </svg>

        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-[#C5A059]/30 blur-md animate-pulse" />
        )}
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendNow();
          }
        }}
        placeholder={
          isRecording
            ? "Listening to your desires..."
            : "Tell Aura your desires..."
        }
        className={`flex-1 bg-transparent py-4 text-[15px] outline-none ${
          isLightMode
            ? "text-black placeholder:text-black/40"
            : "text-white placeholder:text-white/20"
        }`}
      />

      {/* Send */}
      <button
        type="button"
        onClick={sendNow}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#183F34] text-white transition hover:scale-105"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
