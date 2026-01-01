"use client";

import React from "react";

interface AuraListingCardProps {
  listing: any;
  isLightMode: boolean;
  isSelected: boolean;
  onSelect: (listing: any, coords?: { x: number; y: number }) => void;
}

export default function AuraListingCard({
  listing,
  isLightMode,
  isSelected,
  onSelect,
}: AuraListingCardProps) {
  return (
    <div
      onClick={(e) =>
        onSelect(listing, { x: e.clientX, y: e.clientY })
      }
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
        isLightMode
          ? "bg-white text-black border border-black/10"
          : "bg-white/5 text-white border border-white/10"
      } ${isSelected ? "ring-2 ring-[#C5A059]" : "hover:scale-[1.02]"}`}
    >
      {/* Image */}
      {listing.image && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title || "Listing image"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="text-lg font-semibold leading-tight">
          {listing.title || listing.name}
        </h3>

        {(listing.location || listing.city) && (
          <p className="text-sm opacity-70">
            {listing.location || listing.city}
          </p>
        )}

        {listing.category && (
          <p className="text-xs uppercase tracking-wide opacity-50">
            {listing.category}
          </p>
        )}
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 bg-[#C5A059] text-black text-xs px-3 py-1 rounded-full">
          Shortlisted
        </div>
      )}
    </div>
  );
}
