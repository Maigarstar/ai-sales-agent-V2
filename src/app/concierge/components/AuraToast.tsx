"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function AuraToast({ show, message, isLightMode }: any) {
  const bg = isLightMode ? "bg-white/90 border-black/5" : "bg-[#1A1C1B]/90 border-white/10";
  const textColor = isLightMode ? "text-black" : "text-white";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${bg}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C5A059]/20 text-[#C5A059]">
              <CheckCircle2 size={20} strokeWidth={3} />
            </div>
            <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${textColor}`}>
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}