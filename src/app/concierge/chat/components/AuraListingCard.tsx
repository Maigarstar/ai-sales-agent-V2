"use client";

import React from "react";
import { MapPin, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface AuraListingCardProps {
  listing: any;
  isLightMode: boolean;
  isSelected: boolean;
  onSelect: (listing: any) => void;
}

export default function AuraListingCard({
  listing,
  isLightMode,
  isSelected,
  onSelect,
}: AuraListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-[32px] overflow-hidden border transition-all duration-500 ${
        isLightMode 
          ? "bg-white border-black/5 shadow-sm" 
          : "bg-[#121413] border-white/5 shadow-2xl hover:border-[#C5A059]/40"
      }`}
    >
      {/* 1. Image Canvas */}
      <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
        {listing.image ? (
          <img 
            src={listing.image} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C5A059]/10 font-serif text-6xl italic">
            5*
          </div>
        )}
        
        {/* Selection Overlay */}
        <button 
          onClick={() => onSelect(listing)}
          className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-md transition-all z-10 ${
            isSelected 
              ? "bg-[#C5A059] text-black scale-110" 
              : "bg-black/40 text-white hover:bg-white hover:text-black"
          }`}
        >
          <Sparkles size={18} fill={isSelected ? "currentColor" : "none"} />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />
      </div>

      {/* 2. Content Details */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif tracking-wide uppercase text-[#C5A059]">
            {listing.title || listing.name}
          </h3>
          <ArrowUpRight size={16} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black opacity-50 mb-6">
          <MapPin size={12} className="text-[#C5A059]" />
          {listing.location || "Curated Location"}
        </div>

        <button 
          onClick={() => onSelect(listing)}
          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${
            isSelected
              ? "bg-[#C5A059] border-[#C5A059] text-black"
              : "border-white/10 hover:bg-white hover:text-black"
          }`}
        >
          {isSelected ? "In Collection" : "Add to Collection"}
        </button>
      </div>
    </motion.div>
  );
}