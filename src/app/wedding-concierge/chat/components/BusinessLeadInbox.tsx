"use client";

import React from "react";
import { Users, Calendar, DollarSign, ArrowRight, Star, CheckCircle2 } from "lucide-react";

interface Lead {
  id: string;
  couple_name: string;
  status: 'New' | 'Interested' | 'High Intent';
  budget: string;
  date: string;
  aura_insight: string;
}

interface BusinessLeadInboxProps {
  isLightMode: boolean;
}

export default function BusinessLeadInbox({ isLightMode }: BusinessLeadInboxProps) {
  // Mock data - in production, this would fetch from your 'leads' table
  const leads: Lead[] = [
    {
      id: "1",
      couple_name: "Sarah & John",
      status: "High Intent",
      budget: "£75,000",
      date: "Aug 2026",
      aura_insight: "Highly compatible with your 'Noir Garden' package. Interested in mid-week exclusivity."
    },
    {
      id: "2",
      couple_name: "Michael & David",
      status: "Interested",
      budget: "£50,000",
      date: "Dec 2025",
      aura_insight: "Seeking luxury winter aesthetics. Have mentioned your venue as their top choice."
    }
  ];

  const cardClass = `p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer mb-4 ${
    isLightMode ? "bg-white border-black/5 shadow-sm" : "bg-white/5 border-white/10"
  }`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <p className={`text-[10px] tracking-[0.3em] uppercase opacity-40 ${isLightMode ? "text-black" : "text-white"}`}>
          Active Leads
        </p>
        <span className="text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full font-bold">
          {leads.length} NEW
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2">
        {leads.map((lead) => (
          <div key={lead.id} className={cardClass}>
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-bold truncate">{lead.couple_name}</h4>
              {lead.status === "High Intent" && (
                <Star size={14} className="text-[#C5A059] fill-[#C5A059]" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 opacity-60 text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <DollarSign size={10} /> {lead.budget}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={10} /> {lead.date}
              </div>
            </div>

            <div className={`p-3 rounded-xl text-[11px] leading-relaxed mb-4 ${
              isLightMode ? "bg-black/5 text-black/70" : "bg-black/40 text-white/60"
            }`}>
              <span className="font-bold text-[#C5A059]">Aura Insight:</span> {lead.aura_insight}
            </div>

            <button className="w-full py-2 rounded-full bg-[#183F34] text-white text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition">
              Claim Lead <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* REVENUE AXIS: Verification Status */}
      <div className={`mt-auto p-4 rounded-2xl border border-dashed flex items-center gap-3 ${
        isLightMode ? "border-black/10 opacity-60" : "border-white/10 opacity-40"
      }`}>
        <CheckCircle2 size={16} className="text-[#C5A059]" />
        <span className="text-[9px] uppercase tracking-widest leading-tight">
          Verified 5-Star Partner <br/> Status: Active
        </span>
      </div>
    </div>
  );
}