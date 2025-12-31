"use client";

import { useEffect, useState } from "react";

export function useAuraVoice() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript((prev) => prev + result[0].transcript + " ");
        } else {
          interim += result[0].transcript;
        }
      }
    };

    recognition.onend = () => setListening(false);
    if (listening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [listening]);

  const speak = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  return {
    transcript,
    listening,
    speaking,
    startListening: () => setListening(true),
    stopListening: () => setListening(false),
    speak,
    setTranscript,
  };
}
