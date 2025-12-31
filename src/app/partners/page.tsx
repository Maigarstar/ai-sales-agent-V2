import React from "react";
import { ArrowRight, ShieldCheck, Crown, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function PrivatePartnershipsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">
      
      {/* 1. ARCHITECTURAL NAVIGATION */}
      <nav className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-[0.5em] leading-none">5 Star Weddings</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-bold italic">Private Intelligence</span>
        </div>
        <div className="hidden md:block text-[9px] uppercase tracking-[0.4em] opacity-40 font-black">
          Established 2006
        </div>
      </nav>

      <main className="max-w-6xl mx-auto">
        
        {/* 2. THE AUTHORITY HERO */}
        <section className="px-12 py-32 md:py-48 border-b border-[var(--border)]">
          <div className="max-w-4xl">
            <h1 className="luxury-serif text-6xl md:text-8xl uppercase leading-[0.9] tracking-tighter mb-12 dark:text-white">
              A Private Sales <br /> 
              <span className="text-[#C5A059]">Intelligence</span> Platform
            </h1>
            <p className="luxury-serif text-2xl md:text-3xl italic opacity-50 leading-relaxed mb-16 max-w-2xl">
              Atlas helps luxury venues identify, prioritise, and convert high-value enquiries with absolute clarity.
            </p>
            
            {/* THE CENTRAL ACTION */}
            <Link 
              href="/atlas/chat"
              className="inline-flex items-center gap-6 px-12 py-6 bg-[#C5A059] text-black rounded-full group transition-all hover:bg-black hover:text-white"
            >
              <span className="text-xs font-black uppercase tracking-[0.4em]">Initiate Partnership Conversation</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 3. THE ELIGIBILITY GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] border-b border-[var(--border)]">
          <div className="p-12 md:p-20">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] font-black mb-10">Designed For</h3>
            <ul className="space-y-6 luxury-serif text-2xl italic opacity-80">
              <li>Luxury Hotels & Resorts</li>
              <li>Destination Wedding Venues</li>
              <li>High-end Event Estates</li>
              <li>Elite Planning Practices</li>
            </ul>
          </div>
          <div className="p-12 md:p-20 opacity-40">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-black mb-10">Exclusions</h3>
            <p className="text-sm leading-relaxed max-w-xs font-medium uppercase tracking-widest">
              Atlas is not a lead marketplace, mass-enquiry tool, or standard CRM replacement. Access is restricted to brands with proven luxury alignment.
            </p>
          </div>
        </section>

        {/* 4. THE SHIFT: FROM ENQUIRY TO OPPORTUNITY */}
        <section className="px-12 py-32 border-b border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-7">
              <h2 className="luxury-serif text-5xl md:text-6xl uppercase leading-tight mb-8">
                Most venues receive enquiries. <br />
                <span className="italic opacity-30 text-3xl md:text-4xl lowercase">Very few know which ones matter.</span>
              </h2>
            </div>
            <div className="md:col-span-5 space-y-8">
              <p className="text-lg opacity-60 leading-relaxed">
                Atlas transforms raw inbound data into ranked opportunities, providing live intelligence, ownership clarity, and revenue probability insights.
              </p>
              <div className="flex items-center gap-3 text-[#C5A059]">
                 <ShieldCheck size={20} />
                 <span className="text-[10px] uppercase tracking-[0.4em] font-black">Authorized Logic Enabled</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. THE PROTOCOL */}
        <section className="px-12 py-32 border-b border-[var(--border)]">
          <h3 className="text-[10px] uppercase tracking-[0.5em] font-black opacity-30 mb-16 text-center">The Access Protocol</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <ProtocolStep num="01" label="Discreet Consultation" desc="Initiate a secure conversation via the Atlas engine." />
            <ProtocolStep num="02" label="Intelligence Capture" desc="Atlas gathers context, intent, and portfolio fit." />
            <ProtocolStep num="03" label="Executive Review" desc="Our team reviews the internal dossier for alignment." />
            <ProtocolStep num="04" label="Partnership Launch" desc="Approved brands are integrated into the OS." />
          </div>
        </section>

        {/* 6. SOCIAL AUTHORITY */}
        <section className="px-12 py-32 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="flex justify-center">
               <Globe size={32} className="text-[#C5A059] opacity-30" />
            </div>
            <p className="luxury-serif text-2xl italic opacity-50">
              “Designed for global teams where a single booking represents a significant commercial milestone.”
            </p>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
              Built by the 5 Star Weddings Intelligence Unit
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER BRANDING */}
      <footer className="px-12 py-12 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[9px] uppercase tracking-[0.6em] font-black opacity-30">
          5 Star Weddings Ltd • 2006–2025
        </div>
        <div className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">
          Technology Infrastructure by <span className="text-[#C5A059]">Taigenic.ai</span>
        </div>
      </footer>
    </div>
  );
}

/* --- HELPERS --- */

function ProtocolStep({ num, label, desc }: { num: string, label: string, desc: string }) {
  return (
    <div className="space-y-4">
      <div className="luxury-serif text-4xl text-[#C5A059] opacity-30 italic">{num}</div>
      <h4 className="text-[11px] uppercase tracking-[0.3em] font-black">{label}</h4>
      <p className="text-[11px] opacity-40 leading-relaxed max-w-[180px] mx-auto uppercase tracking-widest font-bold">
        {desc}
      </p>
    </div>
  );
}