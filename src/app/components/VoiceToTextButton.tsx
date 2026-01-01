"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

/* =========================================================
   Minimal Web Speech API typings
   ========================================================= */

interface SpeechRecognitionResult {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* =========================================================
   Component
   ========================================================= */

type Props = {
  onText: (text: string) => void;
};

export default function VoiceToTextButton({ onText }: Props) {
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-GB";

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim();

      if (transcript) onText(transcript);
    };

    recognition.onend = () => {
      activeRef.current = false;
      setListening(false);
    };

    recognition.onerror = () => {
      activeRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
      activeRef.current = false;
    };
  }, [onText]);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (activeRef.current) {
      try {
        recognition.stop();
      } catch {}
      activeRef.current = false;
      setListening(false);
      return;
    }

    try {
      activeRef.current = true;
      setListening(true);
      recognition.start();
    } catch {
      activeRef.current = false;
      setListening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop microphone" : "Start microphone"}
      title={listening ? "Stop recording" : "Speak"}
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
