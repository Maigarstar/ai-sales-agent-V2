"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

type Props = {
  onText: (text: string) => void;
};

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceToTextButton({ onText }: Props) {
  const recRef = useRef<SpeechRecognitionType | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec: SpeechRecognitionType = new SpeechRecognition();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += String(res[0]?.transcript || "");
      }
      const t = finalText.trim();
      if (t) onText(t);
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recRef.current = rec;
  }, [onText]);

  function toggle() {
    if (!supported) return;

    const rec = recRef.current;
    if (!rec) return;

    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }

    setListening(true);
    rec.start();
  }

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        className="p-2 rounded-xl border border-gray-200 text-gray-400 bg-white"
        title="Voice to text not supported in this browser"
      >
        <MicOff size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-2 rounded-xl border shadow-sm transition-colors ${
        listening
          ? "bg-[#1F4D3E] text-white border-[#1F4D3E]"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
      title={listening ? "Stop dictation" : "Voice to text"}
    >
      <Mic size={18} />
    </button>
  );
}
