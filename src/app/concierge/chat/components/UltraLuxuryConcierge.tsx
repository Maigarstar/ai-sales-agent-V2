"use client";

import React, { useState, useRef } from "react";
// 1. Import your sub-components
import AuraSidebar from "../components/AuraSidebar";
import AuraListingCard from "../components/AuraListingCard";
import LuxuryChatInput from "../components/LuxuryChatInput"; // The "5-Star" input we just made

// 2. This is the main function (The "UltraLuxuryConcierge")
export default function UltraLuxuryConcierge() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Good evening. I am Aura..." }
  ]);
  const [loading, setLoading] = useState(false);

  // 3. Logic to handle the 5-star input
  const handleSendMessage = async (text: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    
    // API Call Logic here...
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#080808]">
      {/* SIDEBAR */}
      <AuraSidebar open={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} isLightMode={isLightMode} />

      <main className="flex-1 relative flex flex-col">
        {/* HEADER */}
        <header className="p-10 flex justify-between">
           {/* Branding & Theme Toggle */}
        </header>

        {/* CHAT FEED */}
        <div className="flex-1 overflow-y-auto px-10">
           {/* Messages map here */}
        </div>

        {/* THE WORKING INPUT TRAY */}
        <LuxuryChatInput 
          onSendMessage={handleSendMessage} 
          isLightMode={isLightMode} 
          loading={loading} 
        />
      </main>
    </div>
  );
}