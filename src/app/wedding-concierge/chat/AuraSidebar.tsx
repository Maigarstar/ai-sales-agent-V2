"use client";
import React from "react";
import { Heart, Settings, ChevronLeft, Plus, Trash2, MapPin } from "lucide-react";
// ✅ Absolute Alias Import
import BusinessLeadInbox from "@/app/wedding-concierge/components/BusinessLeadInbox";

interface AuraSidebarProps {
  open: boolean;
  onToggle: () => void;
  isLightMode: boolean;
  userType?: 'client' | 'business';
  shortlist?: any[];
  onRemoveFromShortlist?: (id: string) => void;
}

export default function AuraSidebar({ open, onToggle, isLightMode, userType = 'client', shortlist = [], onRemoveFromShortlist }: AuraSidebarProps) {
  const sidebarBg = isLightMode ? "bg-white border-black/10" : "bg-[#121413] border-white/5";
  const textColor = isLightMode ? "text-black" : "text-white";

  return (
    <aside className={`fixed left-0 top-0 h-screen border-r transition-all duration-500 ease-in-out flex flex-col z-[110] shadow-2xl ${sidebarBg} ${
      open ? "w-[320px] translate-x-0" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    }`}>
      <div className="flex h-24 items-center justify-between px-8 shrink-0">
        <div className={`font-serif text-[12px] tracking-[0.3em] uppercase ${textColor}`}>
          {userType === 'business' ? "Partner Portal" : "My Collection"}
        </div>
        <button onClick={onToggle} className={`p-2 rounded-full hover:bg-white/5 transition-colors ${textColor}`}>
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="px-8 mb-10">
        <button className={`w-full flex items-center justify-center gap-3 rounded-full py-4 text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] ${
          isLightMode ? "bg-[#183F34] text-white" : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
        }`}>
          <Plus size={14} /> {userType === 'business' ? "Create Offer" : "New Vision"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 scrollbar-hide">
        {userType === 'business' ? (
          <BusinessLeadInbox isLightMode={isLightMode} />
        ) : (
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-5 opacity-40">
                <p className="text-[10px] uppercase tracking-[0.3em]">Shortlisted</p>
                <Heart size={12} />
              </div>
              <div className="space-y-4">
                {shortlist.length === 0 ? (
                  <p className="text-[10px] opacity-20 text-center py-4 italic">Empty Collection</p>
                ) : (
                  shortlist.map((item) => (
                    <div key={item.id} className="group p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/20 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate">{item.title}</p>
                        <p className="text-[8px] opacity-40 uppercase truncate flex items-center gap-1"><MapPin size={8}/> {item.location || "Global"}</p>
                      </div>
                      <button onClick={() => onRemoveFromShortlist?.(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500/40 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t ${isLightMode ? "border-black/5" : "border-white/5"}`}>
        <button className="w-full flex items-center gap-3 py-2 text-[11px] uppercase tracking-widest opacity-40 hover:opacity-100 transition">
          <Settings size={14} /> Settings
        </button>
      </div>
    </aside>
  );
}