"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AuraTopBar from "./AuraTopBar";
import AuraSidebar from "./AuraSidebar";
import AuraChat from "./AuraChat";
import AuraToast from "./AuraToast";

export default function AuraCompetitionPage() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuGlowing, setIsMenuGlowing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [shortlist, setShortlist] = useState<any[]>([]);
  const [sparkCoords, setSparkCoords] = useState<{ x: number; y: number } | null>(null);

  const toggleShortlist = (listing: any, coords?: { x: number; y: number }) => {
    if (!listing) return;

    const exists = shortlist.some(item => item.id === listing.id);

    if (!exists && coords) {
      setSparkCoords(coords);
      setTimeout(() => setIsMenuGlowing(true), 700);
      setTimeout(() => setIsMenuGlowing(false), 1700);
      setTimeout(() => setSparkCoords(null), 900);
    }

    setShortlist(prev =>
      exists ? prev.filter(item => item.id !== listing.id) : [...prev, listing]
    );
  };

  const handleRequestProposal = async () => {
    if (!shortlist.length) return;

    try {
      const res = await fetch("/api/directory/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: shortlist }),
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        setIsMenuGlowing(true);
        setTimeout(() => setIsMenuGlowing(false), 2000);
      }
    } catch {}
  };

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${
      isLightMode ? "bg-[#F9F9F7]" : "bg-[#0E100F]"
    }`}>
      <AuraToast
        show={showToast}
        message="Collection submitted to Concierge"
        isLightMode={isLightMode}
      />

      <AnimatePresence>
        {sparkCoords && (
          <motion.div
            initial={{ x: sparkCoords.x, y: sparkCoords.y, scale: 1, opacity: 1 }}
            animate={{ x: 60, y: 60, scale: 0, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed z-[300] w-8 h-8 bg-[#C5A059] rounded-full blur-md shadow-[0_0_25px_#C5A059]"
          />
        )}
      </AnimatePresence>

      <AuraTopBar
        onToggleSidebar={() => setIsSidebarOpen(v => !v)}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(v => !v)}
        isShortlisting={isMenuGlowing}
        shortlistCount={shortlist.length}
        session={null}
      />

      <AuraSidebar
        open={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        isLightMode={isLightMode}
        shortlist={shortlist}
        onRemoveFromShortlist={id =>
          setShortlist(prev => prev.filter(i => i.id !== id))
        }
        onRequestProposal={handleRequestProposal}
      />

      <main className="relative h-screen pt-32">
        <AuraChat
          isLightMode={isLightMode}
          shortlist={shortlist}
          onToggleShortlist={toggleShortlist}
        />
      </main>
    </div>
  );
}
