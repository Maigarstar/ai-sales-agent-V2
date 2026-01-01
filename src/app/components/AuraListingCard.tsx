"use client";

import Image from "next/image";

type Props = {
  listing: any;
  isLightMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

export default function AuraListingCard({
  listing,
  isLightMode,
  isSelected,
  onSelect,
}: Props) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative overflow-hidden rounded-2xl border transition
        ${isSelected ? "border-[#C5A059]" : "border-white/10"}
        ${isLightMode ? "bg-white text-black" : "bg-[#121413] text-white"}
        hover:border-[#C5A059]
      `}
    >
      {listing?.image && (
        <div className="relative h-48 w-full">
          <Image
            src={listing.image}
            alt={listing.title || "Listing image"}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-5 text-left space-y-2">
        <h3 className="font-medium text-sm leading-snug">
          {listing.title || "Untitled venue"}
        </h3>

        {listing.location && (
          <p className="text-xs opacity-70">{listing.location}</p>
        )}

        {isSelected && (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-[#C5A059]">
            Selected
          </span>
        )}
      </div>
    </button>
  );
}
