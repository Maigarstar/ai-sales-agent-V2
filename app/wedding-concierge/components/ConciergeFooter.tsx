"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Aura Noir Production Footer
 * Handles centered branding and legal partnership credits.
 */
export default function ConciergeFooter() {
  return (
    <footer className="shrink-0 p-10 flex flex-col items-center border-t border-current/5 bg-transparent transition-colors duration-700">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Centered Legal & Partnership Branding */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase opacity-50">
            <span>Powered by Taigenic.ai</span>
            <span className="opacity-30">•</span>
            <span>5 Star Weddings Ltd. 2006 – 2025</span>
            <span className="opacity-30">•</span>
            <button 
              className="hover:underline transition-all active:opacity-50"
              onClick={() => console.log("Cookie Preferences Triggered")}
            >
              See Cookie Preferences
            </button>
          </div>

          {/* Verification Icon */}
          <div className="flex justify-center opacity-20">
            <ShieldCheck size={14} className="text-current" />
          </div>
        </div>
        
      </div>
    </footer>
  );
}