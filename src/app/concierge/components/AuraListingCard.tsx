"use client";

import React from "react";
import { MapPin, ExternalLink, Star, Plus, Check } from "lucide-react";

export default function AuraListingCard({ 
  listing, 
  isLightMode, 
  isSelected, 
  onSelect 
}: any) {
  
  // 1. CRITICAL FIX: Guard clause to prevent "undefined" reading error
  if (!listing) return null;

  const cardBg = isLightMode ? "bg-white/90 border-black/5" : "bg-[#1A1C1B]/90 border-white/10";
  const textColor = isLightMode ? "text-black" : "text-white";

  const handleAction = (e: React.MouseEvent) => {
    // Capture coordinates for the "fly" animation
    const coords = { x: e.clientX, y: e.clientY };
    onSelect?.(listing, coords);
  };

  return (
    <div className={`group relative w-full rounded-3xl border p-4 transition-all duration-500 backdrop-blur-md hover:scale-[1.02] ${cardBg} ${
      isSelected ? "ring-2 ring-[#C5A059]" : ""
    } ${
      isLightMode 
        ? "shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]" 
        : "shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
    }`}>
      {/* Image Section - Using optional chaining for extra safety */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-black/10">
        {listing?.image ? (
          <img 
            src={listing.image} 
            alt={listing.title || "Partner"} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest opacity-20">
            Image Unattainable
          </div>
        )}
        
        <div className={`absolute top-3 left-3 rounded-full p-2 backdrop-blur-md transition-all ${
          isSelected ? "bg-[#C5A059] text-white scale-110" : "bg-black/20 text-white opacity-0 group-hover:opacity-100"
        }`}>
          {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
        </div>

        <div className="absolute top-3 right-3 rounded-full bg-black/20 backdrop-blur-md p-2 text-white shadow-xl">
          <Star size={14} fill="#C5A059" stroke="#C5A059" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <h3 className={`font-guilder text-xl uppercase leading-tight ${textColor}`}>
          {listing?.title || "Exclusive Partner"}
        </h3>
        <p className={`text-[12px] leading-relaxed line-clamp-2 opacity-70 ${textColor}`}>
          {listing?.short_description}
        </p>
      </div>

      <button 
        onClick={handleAction}
        className={`mt-5 w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
          isSelected 
            ? "bg-transparent border-[#C5A059] text-[#C5A059]" 
            : "bg-[#1D3D33] text-white border-transparent hover:bg-[#C5A059]"
        }`}
      >
        {isSelected ? "Remove from Shortlist" : "Add to Shortlist"}
      </button>
    </div>
  );
}