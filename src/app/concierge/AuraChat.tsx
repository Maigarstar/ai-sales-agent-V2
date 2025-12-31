"use client";

import React, { useEffect, useState, useRef } from "react";
import AuraListingCard from "./AuraListingCard"; 
import { Sparkles, ArrowUp, User } from "lucide-react";
import { motion } from "framer-motion";

interface AuraChatProps {
  isLightMode: boolean;
  shortlist: any[];
  onToggleShortlist: (listing: any) => void;
}

export default function AuraChat({
  isLightMode,
  shortlist,
  onToggleShortlist,
}: AuraChatProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Good evening. I am Aura. How may I assist in curating your vision today?" }
  ]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      // 1️⃣ Unified API Call: Gets text + venues in one shot
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      // 2️⃣ Update text and listings simultaneously
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.reply || "I have curated some options for you below." 
      }]);
      
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered a connection issue. Shall we try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0E100F] text-white">
      {/* 1. Chat Thread Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-10 pb-20">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-6 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                m.role === "user" ? "bg-zinc-800 border-white/10" : "bg-[#121413] border-[#C5A059]/20"
              }`}>
                {m.role === "user" ? <User size={18} /> : <Sparkles size={18} className="text-[#C5A059]" />}
              </div>
              <div className={`max-w-[85%] text-base font-light leading-relaxed ${m.role === "user" ? "text-right" : "text-zinc-300"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* 2. Visual Results Grid (Appears under the chat when found) */}
          {listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-10 border-t border-white/5">
              {listings.map((item, idx) => (
                <AuraListingCard
                  key={item.id || idx}
                  listing={item}
                  isLightMode={isLightMode}
                  isSelected={shortlist.some((s) => s?.id === item.id)}
                  onSelect={() => onToggleShortlist(item)}
                />
              ))}
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] animate-pulse">Aura is sourcing...</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Branded ChatGPT-style Input */}
      <footer className="p-8 bg-gradient-to-t from-[#0E100F] via-[#0E100F] to-transparent">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tell Aura what you're envisioning..."
            className="w-full rounded-full px-8 py-5 bg-[#121413] border border-white/10 text-white outline-none focus:border-[#C5A059]/50 transition-all shadow-2xl"
          />
          <button 
            type="submit" 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-