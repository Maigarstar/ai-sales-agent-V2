"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Crown, Globe, ShieldCheck, 
  Sparkles, Moon, Sun, Menu, Briefcase, 
  Users, Handshake, PanelLeftClose, PanelLeftOpen, X
} from "lucide-react";
import Link from "next/link";

export default function CenteredLegacyHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const theme = isLightMode 
    ? { bg: "bg-[#F9F9F7]", text: "text-black", border: "border-black/10", card: "bg-white/80" }
    : { bg: "bg-[#050505]", text: "text-white", border: "border-white/5", card: "bg-[#121413]/80" };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-1000 ${theme.bg} ${theme.text} font-sans overflow-hidden`}>
      
      {/* 1. OVERLAY SIDEBAR (Prevents Shifting) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 h-full w-[300px] z-[120] border-r ${theme.border} ${isLightMode ? 'bg-[#F3F3F1]' : 'bg-black'} p-8`}
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">The Vault</span>
                <button onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
              </div>
              <nav className="space-y-6">
                {['Collections', 'Archive', 'Privacy', 'Contact'].map(item => (
                  <div key={item} className="text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 cursor-pointer transition-all">
                    {item}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. NAVIGATION BAR */}
      <nav className="w-full z-[100] px-12 py-10 flex justify-between items-center shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-6 group"
        >
          <Menu size={24} className="text-[#C5A059]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">Menu</span>
        </button>

        <div className="flex items-center gap-8">
          <button onClick={() => setIsLightMode(!isLightMode)} className="opacity-40 hover:opacity-100 transition-opacity">
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className={`px-6 py-2 rounded-full border ${theme.border} text-[9px] font-black uppercase tracking-widest hover:border-[#C5A059] transition-all`}>
            Login
          </button>
        </div>
      </nav>

      {/* 3. CENTERED CONTENT CANVAS */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-y-auto scrollbar-hide">
        
        {/* BRANDING HEADER */}
        <header className="text-center mb-20 shrink-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[44px] font-['Gilda_Display',serif] uppercase leading-none tracking-normal mb-2">
              5 STAR WEDDINGS
            </h1>
            <h2 className="text-[35px] font-['Gilda_Display',serif] uppercase text-[#C5A059] leading-none tracking-normal">
              CONCIERGE
            </h2>
            <p className="mt-8 text-sm font-light italic opacity-40 max-w-sm mx-auto">
              "The world&apos;s most exclusive wedding visions, curated by private intelligence."
            </p>
          </motion.div>
        </header>

        {/* DUAL PATHWAY (Gilda inside boxes) */}
        <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-12">
          
          {/* B2C Path */}
          <Link href="/concierge/chat" className="group">
            <div className={`h-full p-10 rounded-[35px] border ${theme.border} ${theme.card} backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[#183F34]/30`}>
              <div className="flex items-center gap-4 mb-6">
                <Users size={20} className="text-[#183F34]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">For Couples</span>
              </div>
              <h3 className="text-3xl font-['Gilda_Display',serif] italic mb-6">Unveil Your Vision</h3>
              <p className="text-xs font-light leading-relaxed opacity-50 mb-10">
                Direct access to Aura, your bespoke intelligence concierge for sourcing the globe&apos;s most hidden venues.
              </p>
              <div className="w-full py-4 bg-[#183F34] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                Enter Concierge <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* B2B Path */}
          <div className="group cursor-pointer">
            <div className={`h-full p-10 rounded-[35px] border ${theme.border} ${theme.card} backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[#C5A059]/30`}>
              <div className="flex items-center gap-4 mb-6">
                <Briefcase size={20} className="text-[#C5A059]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">For Partners</span>
              </div>
              <h3 className="text-3xl font-['Gilda_Display',serif] italic mb-6">Join the Portfolio</h3>
              <p className="text-xs font-light leading-relaxed opacity-50 mb-10">
                Connect with high-intent global inquiries and showcase your excellence within our 5-star artisan network.
              </p>
              <div className="w-full py-4 border border-[#C5A059]/40 text-[#C5A059] rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 group-hover:bg-[#C5A059] group-hover:text-black transition-all">
                Partner Registration <Handshake size={14} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 4. LEGACY SIGNATURE FOOTER */}
      <footer className={`w-full py-10 px-12 border-t ${theme.border} flex justify-center items-center shrink-0`}>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[9px] font-medium uppercase tracking-[0.2em] opacity-30 text-center">
          <span>Powered by Taigenic.ai</span>
          <span className="hidden md:inline text-[#C5A059]">•</span>
          <span>5 Star Weddings Ltd. 2006–2025</span>
          <span className="hidden md:inline text-[#C5A059]">•</span>
          <button className="hover:text-[#C5A059] transition-colors underline decoration-dotted underline-offset-4">
            Cookie Preferences
          </button>
        </div>
      </footer>
    </div>
  );
}