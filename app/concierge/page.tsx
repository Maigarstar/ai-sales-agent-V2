"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, Trash2, Menu, X, ShieldCheck, Plus, Sun, Moon } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const BRAND_GOLD = "#C5A059"; 
const BRAND_GREY = "#666666";

export default function AuraFinalRefinedChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Good evening. I am Aura. Shall we unveil the possibilities for your collection, or are you seeking inspiration?" }
  ]);
  const [input, setInput] = useState("");
  const [isNeuralActive, setIsNeuralActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false); 
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isNeuralActive]);

  const handleSend = async (textOverride?: string) => {
    const content = (textOverride || input).trim();
    if (!content) return;

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsNeuralActive(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      if (data.ok) setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered a disruption. Shall we resume?" }]);
    } finally {
      setIsNeuralActive(false);
    }
  };

  return (
    <div className={`fixed inset-0 flex flex-col antialiased transition-colors duration-700 ${isLightMode ? "bg-[#F9F9F7]" : "bg-[#0E100F]"}`}>
      
      {/* --- SIDEBAR & MODAL OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[60] backdrop-blur-2xl transition-opacity duration-500 ${isSidebarOpen ? "bg-black/70 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`fixed left-0 top-0 z-[70] h-full w-[300px] p-8 transition-transform duration-500 ease-in-out border-r ${isLightMode ? "bg-white border-black/5" : "bg-[#121413] border-white/5"} ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-12">
          <p className={`brand-credit text-[10px] tracking-[0.2em] ${isLightMode ? "text-[#666666]" : "text-white/40"}`}>MANAGEMENT</p>
          <button onClick={() => setIsSidebarOpen(false)} className={`hover:opacity-60 transition-opacity ${isLightMode ? "text-[#666666]" : "text-white"}`}>
            <X size={24}/>
          </button>
        </div>
        <button onClick={() => { setMessages([messages[0]]); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full text-[11px] brand-credit transition-all shadow-xl ${isLightMode ? "bg-[#183F34] text-white" : "bg-white/5 text-white hover:bg-white/10"}`}>
          <Plus size={16} /> NEW DISCOVERY
        </button>
      </aside>

      {/* --- HEADER --- */}
      <header className={`relative z-50 shrink-0 p-8 flex items-center justify-between border-b transition-colors duration-700 ${isLightMode ? "bg-white/90 border-black/5" : "bg-[#0E100F]/90 border-white/5"} backdrop-blur-xl`}>
        <button onClick={() => setIsSidebarOpen(true)} className={`p-2 transition-all ${isLightMode ? "text-[#666666]" : "text-white"}`}>
          <Menu size={26}/>
        </button>
        
        <div className="flex flex-col items-center text-center">
          <h1 className="luxury-serif text-[44px] uppercase tracking-[-0.05em] leading-none" style={{ color: isLightMode ? BRAND_GREY : "white" }}>
            5 Star Weddings
          </h1>
          <h2 className="luxury-serif text-[33px] uppercase tracking-[-0.05em] leading-none mt-1" style={{ color: BRAND_GOLD }}>
            Concierge
          </h2>
          <div className={`w-40 h-[1px] mt-6 relative overflow-hidden ${isLightMode ? "bg-black/10" : "bg-white/10"}`}>
            <div className={`absolute inset-0 ${isLightMode ? "bg-[#666666]" : "bg-white"} ${isNeuralActive ? 'animate-bar' : 'opacity-20'}`} />
          </div>
        </div>

        <button onClick={() => setIsLightMode(!isLightMode)} className={`p-3 rounded-full transition-all ${isLightMode ? "bg-black/5 text-[#666666]" : "text-white/40 hover:text-white"}`}>
          {isLightMode ? <Moon size={22}/> : <Sun size={22}/>}
        </button>
      </header>

      {/* --- CHAT FEED (BUBBLES) --- */}
      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-56" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
              <div className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm ${
                m.role === 'user' 
                  ? `bg-[#C5A059] text-white rounded-br-none` 
                  : `${isLightMode ? "bg-white border border-gray-100 text-[#333333]" : "bg-[#1A1C1B] border border-white/5 text-white"} rounded-bl-none`
              }`}>
                <p className={`${m.role === 'user' ? 'luxury-serif text-lg' : 'font-light leading-relaxed text-[16px] md:text-[17px]'}`}>
                  {m.content}
                </p>
              </div>
            </div>
          ))}
          {isNeuralActive && (
             <div className="flex gap-2 p-4 items-center opacity-40">
               <div className={`w-2 h-2 rounded-full animate-bounce ${isLightMode ? "bg-[#666666]" : "bg-white"}`} />
               <div className={`w-2 h-2 rounded-full animate-bounce ${isLightMode ? "bg-[#666666]" : "bg-white"}`} style={{ animationDelay: '200ms' }} />
             </div>
          )}
        </div>
      </main>

      {/* --- FOOTER AREA --- */}
      <footer className={`shrink-0 p-8 relative z-50 bg-gradient-to-t via-transparent transition-colors duration-700 ${isLightMode ? "from-[#F9F9F7]" : "from-[#0E100F]"}`}>
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Chat Input */}
          <div className={`w-full relative glass-panel rounded-full border transition-all duration-300 mb-8 ${isLightMode ? "bg-white border-black/10 shadow-xl" : "border-white/10 shadow-2xl"}`}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell Aura your desires..."
              className={`w-full bg-transparent px-8 py-5 text-[16px] outline-none ${isLightMode ? "text-[#333333] placeholder:text-[#666666]/40" : "text-white placeholder:text-white/20"}`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
               <button className={`p-2 opacity-20 hover:opacity-100 transition-opacity ${isLightMode ? "text-[#333333]" : "text-white"}`}>
                 <Mic size={22}/>
               </button>
               <button onClick={() => handleSend()} className={`p-3 rounded-full transition-all shadow-2xl ${isLightMode ? "bg-[#183F34] text-white" : "bg-white text-black"}`}>
                 <Send size={20}/>
               </button>
            </div>
          </div>

          {/* Centered Footer Branding */}
          <div className="text-center space-y-3">
             <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] md:text-[11px] font-medium tracking-wide">
                <span className={isLightMode ? "text-[#666666]" : "text-white/60"}>Powered by Taigenic.ai</span>
                <span className="opacity-30">•</span>
                <span className={isLightMode ? "text-[#666666]" : "text-white/60"}>5 Star Weddings Ltd. 2006 – 2025</span>
                <span className="opacity-30">•</span>
                <button className={`hover:underline ${isLightMode ? "text-[#666666]" : "text-white/60"}`}>See Cookie Preferences</button>
             </div>
             <div className="flex justify-center opacity-20">
                <ShieldCheck size={12} />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}