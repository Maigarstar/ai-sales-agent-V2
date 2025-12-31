"use client";

import React from "react";
import { Inbox, Zap, ArrowUpRight } from "lucide-react";

export default function BusinessLeadInbox({ isLightMode }: { isLightMode: boolean }) {
  const textColor = isLightMode ? "text-black" : "text-white";
  const cardBg = isLightMode ? "bg-black/5" : "bg-white/5";

  // Mock data for the competition test
  const leads = [
    { id: 1, name: "Sarah & James", status: "Hot", budget: "£85k", intent: "Destination Wedding" },
    { id: 2, name: "Michael Chen", status: "Warm", budget: "£40k", intent: "Private Event" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between opacity-40">
        <p className="text-[10px] uppercase tracking-[0.3em]">Priority Leads</p>
        <Inbox size={12} />
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div 
            key={lead.id}
            className={`p-4 rounded-2xl border border-transparent hover:border-[#C5A059]/30 transition-all cursor-pointer group ${cardBg}`}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold">{lead.name}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                lead.status === 'Hot' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-[10px] opacity-50 mb-3">{lead.intent}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#C5A059]">{lead.budget}</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full py-3 rounded-xl border border-dashed text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition ${
        isLightMode ? "border-black/20" : "border-white/20"
      }`}>
        View All Records
      </button>
    </div>
  );
}