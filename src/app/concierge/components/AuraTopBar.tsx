"use client";

import React, { useState } from "react";
import { Menu, Moon, Sun, LogOut, Settings } from "lucide-react";

interface AuraTopBarProps {
  onToggleSidebar: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  session: any;
  userType?: "client" | "business";
  isShortlisting?: boolean; // Trigger for the gold pulse
  shortlistCount?: number;   // New: Badge count
}

export default function AuraTopBar({
  onToggleSidebar,
  isLightMode,
  onToggleTheme,
  session,
  userType = "client",
  isShortlisting = false,
  shortlistCount = 0,
}: AuraTopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const headerBg = isLightMode
    ? "bg-white/80 border-black/10"
    : "bg-[#0E100F]/80 border-white/10";
  const textColor = isLightMode ? "text-black" : "text-white";

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-32 flex items-center px-10 z-[100] backdrop-blur-md border-b transition-all duration-500 ${headerBg}`}
    >
      {/* LEFT: SIDEBAR TOGGLE + NOTIFICATION BADGE */}
      <div className="flex-1 flex items-center">
        <div className="relative">
          {/* 1. Animated Glow Ring when spark hits */}
          <div className={`absolute inset-0 rounded-full bg-[#C5A059] blur-md transition-all duration-500 ${
            isShortlisting ? "scale-150 opacity-40 animate-pulse" : "scale-0 opacity-0"
          }`} />
          
          <button 
            onClick={onToggleSidebar} 
            className={`relative z-10 p-2 rounded-full transition-all duration-500 ${textColor} ${
              isShortlisting ? "scale-110 text-[#C5A059]" : "hover:opacity-50"
            }`}
          >
            <Menu size={32} />
            
            {/* 2. Notification Badge Count */}
            {shortlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-[10px] font-black text-white shadow-lg animate-in zoom-in duration-300">
                {shortlistCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CENTER: BRANDING (Absolute Positioned for perfect iMac centering) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none w-max">
        <h1
          className={`luxury-serif uppercase tracking-tighter leading-none ${textColor}`}
          style={{ fontSize: 45 }}
        >
          5 Star Weddings
        </h1>
        <h2
          className="luxury-serif uppercase tracking-[0.3em] text-[35px] mt-1"
          style={{ color: "#C5A059" }}
        >
          Concierge
        </h2>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex-1 flex items-center justify-end gap-8">
        <button
          onClick={onToggleTheme}
          className={`transition-transform hover:scale-110 ${textColor}`}
        >
          {isLightMode ? <Moon size={26} /> : <Sun size={26} />}
        </button>

        <div className="relative">
          {session ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-10 w-10 rounded-full bg-[#183F34] flex items-center justify-center text-white text-xs font-bold border border-white/10"
            >
              {session.user.email?.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => (window.location.href = "/public/login")}
              className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] font-black transition-all hover:scale-105 shadow-xl ${
                isLightMode ? "bg-[#183F34] text-white" : "bg-white text-black"
              }`}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}