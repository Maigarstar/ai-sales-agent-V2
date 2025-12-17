"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function VoiceToTextButton({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-GB";

    rec.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      const clean = String(transcript).trim();
      if (clean) onText(clean);
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, [onText]);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (listening) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      setListening(false);
      return;
    }

    try {
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop microphone" : "Start microphone"}
      title={listening ? "Stop" : "Speak"}
      className={`h-11 w-11 rounded-full flex items-center justify-center border shadow-sm transition ${
        listening
          ? "bg-black text-white border-black"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {listening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
