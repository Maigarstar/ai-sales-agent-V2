"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, ArrowUp, User, Moon, Sun, 
  Plus, MessageSquare, Mic, MicOff, X, LogIn
} from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  content: string; 
  listings?: any[] 
};

export default function ProductionPlatinumConcierge() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Good evening. I am Aura. How may I assist in curating your vision today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. ENHANCED MARKDOWN & PARAGRAPH PARSER ---
  const formatContent = (text: string) => {
    // Preserves line breaks while styling bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-[#C5A059]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // --- 2. WEIGHTED AUTO-SCROLL (PREVENTS CUT-OFF) ---
  useEffect(() => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      // Added +250 offset to ensure the last listing card is fully visible
      scrollRef.current.scrollTo({ top: scrollHeight + 250, behavior: "smooth" });
    }
  }, [messages, loading]);

  // --- 3. VOICE RECOGNITION ---
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    isListening ? recognition.stop() : recognition.start();
  };

  // --- 4. PRODUCTION-READY FETCH CALL ---
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-store" // Security/Freshness header
        },
        body: JSON.stringify({ message: userText }),
      });
      
      const data = await res.json();
      
      // Simulate realism with a subtle concierge pause
      await new Promise(r => setTimeout(r, 700));

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.reply || "Let’s refine this together.",
        // Guard against undefined listings
        listings: Array.isArray(data.listings) ? data.listings : [] 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I am here with you. Let us take a moment and continue." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const theme = isLightMode 
    ? { bg: "bg-[#F9F9F7]", text: "text-black", border: "border-black/10", tray: "bg-white", bubble: "bg-[#F3F3F1] border-black/5" }
    : { bg: "bg-[#0A0A0A]", text: "text-white", border: "border-white/5", tray: "bg-[#1A1A1A]", bubble: "bg-[#121413] border-white/5" };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-1000 ${theme.bg} ${theme.text} font-sans overflow-hidden relative`}>
      
      {/* 5. OVERLAY SIDEBAR (ZERO-SHIFT) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110]" />
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={`fixed left-0 top-0 h-full w-[320px] z-[120] border-r ${theme.border} ${isLightMode ? 'bg-white' : 'bg-black'} p-10 flex flex-col`}>
              <div className="flex justify-between items-center mb-16">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C5A059]">The Vault</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={20} className="text-[#C5A059]"/></button>
              </div>
              <button className="w-full py-4 rounded-xl border border-[#C5A059]/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#C5A059]/10">
                <Plus size={14}/> New Vision
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 6. ABSOLUTE CENTERED BRAND HEADER */}
      <header className="w-full px-12 py-10 flex justify-between items-center z-[100] shrink-0 relative">
        <div className="flex-1 flex justify-start items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#C5A059]/10 rounded-full transition-all">
            <Menu size={26} className="text-[#C5A059]" />
          </button>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <h1 className="text-[44px] font-['Gilda_Display',serif] uppercase leading-none tracking-normal mb-1">
            5 STAR WEDDINGS
          </h1>
          <h2 className="text-[35px] font-['Gilda_Display',serif] uppercase text-[#C5A059] leading-none tracking-normal">
            CONCIERGE
          </h2>
        </div>

        <div className="flex-1 flex justify-end items-center gap-8">
          <button onClick={() => setIsLightMode(!isLightMode)} className="opacity-40 hover:opacity-100 transition-opacity">
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className={`px-6 py-2 rounded-full border ${theme.border} text-[9px] font-black uppercase tracking-widest hover:border-[#C5A059] transition-all`}>
            Login
          </button>
        </div>
      </header>

      {/* 7. CENTERED FEED WITH LIVE LISTINGS */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 scrollbar-hide flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-12 py-10">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-6 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {m.role === "user" ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-zinc-800 shadow-md">
                    <User size={18} className="text-white" />
                  </div>
                ) : <div className="w-10 shrink-0" />}

                <div className="flex flex-col gap-6 max-w-[85%]">
                  <div className={`px-7 py-5 rounded-[26px] text-[17px] leading-relaxed font-['Gilda_Display',serif] shadow-sm transition-all whitespace-pre-wrap ${
                    m.role === "user" ? "bg-[#183F34] text-white rounded-tr-none shadow-lg" : `${theme.bubble} rounded-tl-none`
                  }`}>
                    {formatContent(m.content)}
                  </div>

                  {/* 8. DYNAMIC LISTING CARDS WITH FLEXIBLE IMAGE KEYS */}
                  {m.listings && m.listings.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 mt-2">
                      {m.listings.map((item, idx) => {
                        const imgUrl = item.image || item.main_image_url || item.images?.main?.url;
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-[28px] border ${theme.border} overflow-hidden bg-white/5 backdrop-blur-md hover:scale-[1.01] transition-transform`}
                          >
                            {imgUrl && (
                              <img src={imgUrl} alt={item.title} className="w-full h-56 object-cover" />
                            )}
                            <div className="p-6">
                              <h3 className="text-xl font-['Gilda_Display',serif] text-[#C5A059] mb-2">{item.title}</h3>
                              <p className="text-sm opacity-60 leading-relaxed line-clamp-2">{item.description}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <p className="text-center text-[10px] uppercase tracking-[0.5em] text-[#C5A059] animate-pulse">Aura Curating...</p>}
        </div>
      </main>

      {/* 9. REFINED COMMAND TRAY & LEGACY FOOTER */}
      <footer className="w-full px-10 pb-8 pt-4 flex flex-col items-center shrink-0 relative z-50">
        <div className="w-full max-w-2xl">
          <div className={`relative rounded-full border shadow-2xl transition-all ${theme.tray} ${theme.border} focus-within:border-[#C5A059]/40 p-1`}>
            <div className="flex items-center gap-3 px-6">
              <button onClick={toggleVoiceInput} className={`p-2 transition-all ${isListening ? 'text-[#C5A059] animate-pulse scale-125' : 'opacity-20 hover:opacity-100 text-[#C5A059]'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === "Enter") handleSend(); }} placeholder={isListening ? "Listening to your vision..." : "Describe your vision..."} className="flex-1 bg-transparent border-none outline-none py-4 text-[17px] font-['Gilda_Display',serif] placeholder:opacity-20" />
              <button onClick={handleSend} className={`p-3.5 rounded-full transition-all ${input.trim() ? 'bg-[#183F34] text-white shadow-xl' : 'bg-zinc-800 text-zinc-600 opacity-40'}`}>
                <ArrowUp size={22} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 opacity-30 text-[9px] font-medium uppercase tracking-[0.2em] text-center">
             <span>Powered by Taigenic.ai • 5 Star Weddings Ltd. 2006–2025 • Cookie Preferences</span>
          </div>
        </div>
      </footer>
    </div>
  );
}