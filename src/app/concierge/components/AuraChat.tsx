"use client";

import React, { useEffect, useState } from "react";
import AuraListingCard from "./AuraListingCard";

interface AuraChatProps {
  isLightMode: boolean;
  shortlist: any[];
  onToggleShortlist: (listing: any, coords?: { x: number; y: number }) => void;
}

export default function AuraChat({
  isLightMode,
  shortlist,
  onToggleShortlist,
}: AuraChatProps) {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 READ ONBOARDING CONTEXT + INSTANT SEARCH
  useEffect(() => {
    try {
      const storedQuery = localStorage.getItem("aura_initial_query");
      if (storedQuery) {
        const parsed = JSON.parse(storedQuery);
        if (parsed?.keyword) {
          setQuery(parsed.keyword);
          fetchListings(parsed.keyword);
        }
        localStorage.removeItem("aura_initial_query");
      }
    } catch (e) {
      console.error("Aura init error", e);
    }
  }, []);

  const fetchListings = async (q: string) => {
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/concierge/listings?q=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!data?.ok || !Array.isArray(data.listings)) {
        setListings([]);
        return;
      }

      setListings(data.listings.filter(Boolean));
    } catch (err) {
      console.error("Concierge fetch error", err);
      setError("Unable to load curated results");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(query);
  };

  return (
    <div className="relative h-full w-full px-6 pb-12 overflow-y-auto">
      {/* Header */}
      <div className="mb-10 max-w-4xl mx-auto">
        <h2
          className={`luxury-serif text-3xl mb-3 ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          Aura Concierge
        </h2>
        <p className="text-sm opacity-70">
          Tell me what you are looking for and I will curate options instantly.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-12">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search venues, destinations, or vendors"
          className={`w-full rounded-full px-8 py-5 outline-none transition-all ${
            isLightMode
              ? "bg-black/5 text-black placeholder:text-black/40"
              : "bg-white/5 text-white placeholder:text-white/40"
          }`}
        />
      </form>

      {/* Status */}
      {loading && (
        <p className="text-center text-sm opacity-60">
          Aura is curating refined options…
        </p>
      )}

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      {/* Results */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {listings.map((listing, i) => (
          <AuraListingCard
            key={listing.url || i}
            listing={listing}
            isLightMode={isLightMode}
            isSelected={shortlist.some((s) => s?.url === listing.url)}
            onSelect={onToggleShortlist}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && listings.length === 0 && query && (
        <p className="text-center opacity-50 text-sm mt-20">
          No curated matches found. Try refining your search.
        </p>
      )}
    </div>
  );
}
