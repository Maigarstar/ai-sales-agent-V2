"use client";

import { useState } from "react";
import BaseChat from "./BaseChat";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ConciergeChatFrame() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, I’m Aura, your wedding concierge. Tell me about your plans.",
    },
  ]);

  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "Perfect. Let’s plan this beautifully, step by step.",
      },
    ]);

    setInput("");
  }

  return (
    <BaseChat
      messages={messages}
      input={input}
      setInput={setInput}
      onSend={handleSend}
    />
  );
}
