"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, Zap } from "lucide-react";

const BRAND_GOLD = "#C5A059";

export default function AuraOnboarding() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"couple" | "vendor" | null>(null);

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;
    localStorage.setItem("aura_onboarding", JSON.stringify({ email, role }));
    router.push("/wedding-concierge/chat");
  };

  return (
    <div className="min-h-screen bg-[#0E100F] text-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#C5A059]/30">
      {/* Branding Header */}
      <header className="mb-16 text-center">
        <h1 className="luxury-serif text-[44px] uppercase tracking-[-0.05em] leading-none mb-2">
          5 Star Weddings
        </h1>
        <h2
          className="luxury-serif text-[33px] uppercase tracking-[-0.05em] leading-none"
          style={{ color: BRAND_GOLD }}
        >
          Your AI Concierge Experience
        </h2>
        <p className="mt-3 text-sm opacity-80">
          Begin with your role and email, then Aura curates venues, vendors, and next steps tailored to you.
        </p>
        <div className="w-24 h-[1px] bg-white/10 mx-auto mt-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white animate-bar" />
        </div>
      </header>

      {/* Value Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mb-16">
        {/* Vendor */}
        <div
          onClick={() => setRole("vendor")}
          className={`glass-panel p-10 rounded-[30px] cursor-pointer transition-all duration-500 border ${
            role === "vendor"
              ? "border-[#C5A059] scale-[1.02] shadow-[0_0_50px_rgba(197,160,89,0.15)]"
              : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-3 mb-6" style={{ color: BRAND_GOLD }}>
            <Zap size={20} />
            <p className="brand-credit text-[10px] tracking-widest uppercase">For Professionals</p>
          </div>
          <h3 className="luxury-serif text-3xl mb-4">Elevate Your Reach</h3>
          <ul className="space-y-4 opacity-80 font-light text-sm">
            <li>• Access high net worth lead intelligence</li>
            <li>• Improve your visibility in our global collection</li>
            <li>• Direct neural to human handovers</li>
          </ul>
        </div>

        {/* Couple */}
        <div
          onClick={() => setRole("couple")}
          className={`glass-panel p-10 rounded-[30px] cursor-pointer transition-all duration-500 border ${
            role === "couple"
              ? "border-[#C5A059] scale-[1.02] shadow-[0_0_50px_rgba(197,160,89,0.15)]"
              : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-3 mb-6" style={{ color: BRAND_GOLD }}>
            <Star size={20} />
            <p className="brand-credit text-[10px] tracking-widest uppercase">For Couples</p>
          </div>
          <h3 className="luxury-serif text-3xl mb-4">Unveil the Impossible</h3>
          <ul className="space-y-4 opacity-80 font-light text-sm">
            <li>• Bespoke venue sourcing with precision</li>
            <li>• Private introductions to refined vendors</li>
            <li>• Calm, clear steps guided by Aura</li>
          </ul>
        </div>
      </div>

      {/* Lead Capture */}
      <form onSubmit={handleEntry} className="w-full max-w-md space-y-6">
        <div className="relative group">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to meet Aura"
            className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-center text-white outline-none focus:border-[#C5A059]/50 transition-all placeholder:text-white/30"
          />
        </div>

        <button
          disabled={!role || !email}
          className="w-full bg-white text-black py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#C5A059] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
        >
          Begin Discovery
          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <p className="text-center brand-credit text-[9px] opacity-40 uppercase tracking-[0.2em]">
          By entering, you agree to our private collection terms.
        </p>
      </form>

      {/* Footer */}
      <footer className="mt-20 text-center space-y-2 opacity-60">
        <p className="brand-credit text-[10px] tracking-widest uppercase">
          Powered by Taigenic.ai • 5 Star Weddings Ltd. 2006 to 2025
        </p>
        <div className="flex justify-center gap-4 text-[9px]">
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Cookie Preferences</span>
        </div>
      </footer>
    </div>
  );
}
