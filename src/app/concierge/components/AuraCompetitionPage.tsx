"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuraTopBar from "./components/AuraTopBar";
import AuraSidebar from "./components/AuraSidebar";
import AuraChat from "./components/AuraChat";
import AuraToast from "./components/AuraToast"; // Ensure this is created

export default function AuraCompetitionPage() {
  // 1. UI & THEME STATE
  const [isLightMode, setIsLightMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuGlowing, setIsMenuGlowing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // 2. COLLECTION & ANIMATION STATE
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [sparkCoords, setSparkCoords] = useState<{ x: number; y: number } | null>(null);

  // 3. COLLECTION LOGIC
  const toggleShortlist = (listing: any, coords?: { x: number; y: number }) => {
    if (!listing) return;
    const exists = shortlist.find((item) => item.id === listing.id);
    
    if (!exists && coords) {
      setSparkCoords(coords);
      setTimeout(() => {
        setIsMenuGlowing(true);
        setTimeout(() => setIsMenuGlowing(false), 1000);
      }, 750);
      setTimeout(() => setSparkCoords(null), 850);
    }

    setShortlist((prev) => 
      exists ? prev.filter((item) => item.id !== listing.id) : [...prev, listing]
    );
  };

  // 4. REQUEST PROPOSAL LOGIC
  const handleRequestProposal = async () => {
    if (shortlist.length === 0) return;

    try {
      const response = await fetch("/api/directory/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: shortlist,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Success Feedback: Show premium toast and pulse menu
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000); // Auto-hide toast
        
        setIsMenuGlowing(true);
        setTimeout(() => setIsMenuGlowing(false), 2000);
      }
    } catch (error) {
      console.error("Proposal Submission Error:", error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden ${
      isLightMode ? "bg-[#F9F9F7]" : "bg-[#0E100F]"
    }`}>
      
      {/* 1. SUCCESS TOAST: Bottom-centered notification */}
      <AuraToast 
        show={showToast} 
        message="Collection Submitted to Concierge" 
        isLightMode={isLightMode} 
      />

      {/* 2. FLYING SPARK ANIMATION */}
      <AnimatePresence>
        {sparkCoords && (
          <motion.div
            initial={{ x: sparkCoords.x, y: sparkCoords.y, scale: 1, opacity: 1 }}
            animate={{ x: 60, y: 60, scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[300] w-8 h-8 bg-[#C5A059] rounded-full blur-[2px] shadow-[0_0_25px_#C5A059] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AuraTopBar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
        isShortlisting={isMenuGlowing}
        shortlistCount={shortlist.length}
        session={null}
      />

      <AuraSidebar 
        open={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        isLightMode={isLightMode}
        shortlist={shortlist}
        onRemoveFromShortlist={(id) => setShortlist(prev => prev.filter(i => i.id !== id))}
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