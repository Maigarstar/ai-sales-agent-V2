"use client";

import React from "react";
import { 
  Heart, History, Settings, ChevronLeft, 
  LayoutDashboard, MessageSquare, Plus, Trash2, MapPin
} from "lucide-react";
// ✅ Absolute import to prevent pathing breaks
import BusinessLeadInbox from "@/app/wedding-concierge/components/BusinessLeadInbox";

interface AuraSidebarProps {
  open: boolean;
  onToggle: () => void;
  isLightMode: boolean;
  userType?: 'client' | 'business';
  shortlist?: any[];
  onRemoveFromShortlist?: (id: string) => void;
}

export default function AuraSidebar({
  open,
  onToggle,
  isLightMode,
  userType = 'client',
  shortlist = [],
  onRemoveFromShortlist
}: AuraSidebarProps) {
  
  const sidebarBg = isLightMode ? "bg-white border-black/10" : "bg-[#121413] border-white/5";
  const textColor = isLightMode ? "text-black" : "text-white";

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] transition-opacity duration-500"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen border-r transition-all duration-500 ease-in-out flex flex-col z-[110] shadow-2xl ${
          sidebarBg
        } ${open ? "w-[320px] translate-x-0" : "w-0 -translate-x-full opacity-0 pointer-events-none"}`}
      >
        {/* 1. BRANDING & TOGGLE */}
        <div className="flex h-24 items-center justify-between px-8 shrink-0">
          <div className={`font-serif text-[12px] tracking-[0.3em] uppercase ${textColor}`}>
            {userType === 'business' ? "Partner Portal" : "My Collection"}
          </div>
          <button
            onClick={onToggle}
            className={`p-2 rounded-full hover:bg-white/5 transition-colors ${textColor}`}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* 2. PRIMARY ACTION */}
        <div className="px-8 mb-10">
          <button 
            className={`w-full flex items-center justify-center gap-3 rounded-full py-4 text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] ${
              isLightMode 
                ? "bg-[#183F34] text-white" 
                : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
            }`}
          >
            <Plus size={14} /> 
            {userType === 'business' ? "Create New Offer" : "New Vision Session"}
          </button>
        </div>

        {/* 3. DYNAMIC CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-8 scrollbar-hide">
          {userType === 'business' ? (
            <div className="space-y-8">
              <BusinessLeadInbox isLightMode={isLightMode} />
              <nav className="space-y-2 pt-4 border-t border-white/10">
                <button className="w-full flex items-center gap-3 py-2 text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100 transition">
                  <LayoutDashboard size={14} /> Analytics
                </button>
                <button className="w-full flex items-center gap-3 py-2 text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100 transition">
                  <MessageSquare size={14} /> Active Chats
                </button>
              </nav>
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-5 opacity-40">
                  <p className="text-[10px] uppercase tracking-[0.3em]">Shortlisted</p>
                  <Heart size={12} />
                </div>

                <div className="space-y-4">
                  {shortlist.length === 0 ? (
                    <p className="text-[10px] uppercase tracking-widest opacity-20 text-center py-4 italic font-light">Collection Empty</p>
                  ) : (
                    shortlist.map((item) => (
                      <div key={item.id} className="group p-3 rounded-2xl border border-white/5 bg-white/5 transition-all relative">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#C5A059]/10 text-[#C5A059] text-[8px] font-bold">5*</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate leading-tight">{item.title}</p>
                            <div className="flex items-center gap-1 opacity-40 text-[9px] uppercase tracking-tighter mt-1 font-medium">
                              <MapPin size={8} />
                              <span className="truncate">{item.location || "Global"}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => onRemoveFromShortlist?.(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-5 opacity-40">
                  <p className="text-[10px] uppercase tracking-[0.3em]">History</p>
                  <History size={12} />
                </div>
                <ul className="space-y-3">
                  {['Summer Itinerary', 'Private Travel Plans'].map((item) => (
                    <li key={item} className="text-[12px] opacity-60 hover:opacity-100 cursor-pointer flex items-center gap-3 group transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] group-hover:scale-150 transition-transform" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER CONTROLS */}
        <div className={`p-8 border-t ${isLightMode ? "border-black/5" : "border-white/5"}`}>
          {shortlist.length > 0 && (
            <button className="w-full mb-6 py-4 rounded-xl bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:brightness-110 transition-all">
              Inquire Collection ({shortlist.length})
            </button>
          )}
          <button className="w-full flex items-center gap-3 py-2 text-[11px] uppercase tracking-widest opacity-40 hover:opacity-100 transition">
            <Settings size={14} /> Global Settings
          </button>
          <div className="mt-6 text-[9px] uppercase tracking-[0.2em] opacity-30 text-center">
            Aura Premium Concierge • v3.1
          </div>
        </div>
      </aside>
    </>
  );
}