"use client";

import React from "react";

export default function AuraListingSkeleton({ isLightMode }: { isLightMode: boolean }) {
  const cardBg = isLightMode ? "bg-white/90 border-black/5" : "bg-[#1A1C1B]/90 border-white/10";
  const pulseColor = isLightMode ? "bg-black/5" : "bg-white/5";

  return (
    <div className={`w-full rounded-3xl border p-4 backdrop-blur-md animate-pulse ${cardBg} ${
      isLightMode 
        ? "shadow-[0_20px_50px_rgba(0,0,0,0.08)]" 
        : "shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
    }`}>
      {/* Image Placeholder */}
      <div className={`h-48 w-full rounded-2xl ${pulseColor}`} />

      {/* Content Placeholder */}
      <div className="mt-5 space-y-3">
        <div className="flex justify-between">
          <div className={`h-6 w-2/3 rounded-lg ${pulseColor}`} />
          <div className={`h-6 w-6 rounded-full ${pulseColor}`} />
        </div>
        <div className={`h-3 w-1/3 rounded-md ${pulseColor}`} />
        <div className="space-y-2">
          <div className={`h-3 w-full rounded-md ${pulseColor}`} />
          <div className={`h-3 w-4/5 rounded-md ${pulseColor}`} />
        </div>
      </div>

      {/* Button Placeholder */}
      <div className={`mt-5 h-12 w-full rounded-xl ${pulseColor}`} />
    </div>
  );
}