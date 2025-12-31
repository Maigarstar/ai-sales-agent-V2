"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Briefcase, Calendar, MapPin, DollarSign, Users } from "lucide-react";
import { supabaseBrowser } from "@/lib/_supabase-browser";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  userType: 'couple' | 'business';
  isLightMode: boolean;
}

export default function ProfileModal({ isOpen, onClose, session, userType, isLightMode }: ProfileModalProps) {
  const sb = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    if (session?.user?.id) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
  };

  const handleSave = async () => {
    setLoading(true);
    await sb.from('profiles').update(profile).eq('id', session.user.id);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-all ${
    isLightMode ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
  }`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
      <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl relative transition-colors ${
        isLightMode ? "bg-white text-black" : "bg-[#1A1C1B] text-white"
      }`}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X /></button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-[#C5A059]/20 text-[#C5A059]">
            {userType === 'couple' ? <User size={28}/> : <Briefcase size={28}/>}
          </div>
          <div>
            <h2 className="text-2xl luxury-serif">{userType === 'couple' ? 'Wedding Vision' : 'Business Profile'}</h2>
            <p className="text-xs opacity-50 uppercase tracking-widest">Manage your {userType} account</p>
          </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
          {userType === 'couple' ? (
            <>
              {/* Couple Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Destination</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-4 opacity-30" />
                    <input className={`${inputClass} pl-10`} value={profile.destination || ''} onChange={(e) => setProfile({...profile, destination: e.target.value})} placeholder="e.g. Tuscany" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Budget</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-4 opacity-30" />
                    <input className={`${inputClass} pl-10`} value={profile.budget_range || ''} onChange={(e) => setProfile({...profile, budget_range: e.target.value})} placeholder="e.g. £50k - £75k" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Guest Count</label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-4 opacity-30" />
                    <input type="number" className={`${inputClass} pl-10`} value={profile.guest_count || ''} onChange={(e) => setProfile({...profile, guest_count: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Wedding Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-4 opacity-30" />
                    <input type="date" className={`${inputClass} pl-10`} value={profile.wedding_date || ''} onChange={(e) => setProfile({...profile, wedding_date: e.target.value})} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Business Fields */}
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Company Name</label>
                <input className={inputClass} value={profile.company_name || ''} onChange={(e) => setProfile({...profile, company_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Business Category</label>
                <select className={inputClass} value={profile.category || ''} onChange={(e) => setProfile({...profile, category: e.target.value})}>
                  <option value="Venue">Luxury Venue</option>
                  <option value="Planner">Wedding Planner</option>
                  <option value="Photographer">Photography</option>
                </select>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-8 flex items-center justify-center gap-2 bg-[#183F34] text-white rounded-full py-4 text-xs uppercase tracking-widest hover:opacity-90 transition"
        >
          {loading ? "Syncing..." : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}