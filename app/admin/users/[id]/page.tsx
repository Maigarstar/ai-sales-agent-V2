"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, Mail, Coins, Calendar, 
  History, ArrowLeft, ShieldAlert,
  Sparkles, ExternalLink, Loader2
} from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tryons, setTryons] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFullUserProfile() {
      setLoading(true);
      
      // 1. Fetch Core Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      // 2. Fetch Coin History
      const { data: txs } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      // 3. Fetch Aura Activity (Try-ons & Bookings)
      const { data: actions } = await supabase
        .from("aura_tryon_logs")
        .select("*, store_inventory(model_name, image_url)")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setUserData(profile);
      setTransactions(txs || []);
      setTryons(actions || []);
      setLoading(false);
    }

    if (id) fetchFullUserProfile();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1F4D3E]" /></div>;
  if (!userData) return <div className="p-20 text-center">User not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* NAVIGATION & ACTIONS */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#1F4D3E] transition-colors">
          <ArrowLeft size={18} /> Back to Users
        </button>
        <button className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-2">
          <ShieldAlert size={14} /> Suspend Account
        </button>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-[#1F4D3E] to-[#163C30] rounded-3xl flex items-center justify-center text-white text-3xl font-serif">
          {userData.full_name?.charAt(0) || <User size={40} />}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-serif text-[#1F4D3E]">{userData.full_name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Mail size={14} /> {userData.email}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(userData.created_at).toLocaleDateString()}</span>
            <span className="bg-[#1F4D3E]/10 text-[#1F4D3E] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">{userData.user_type}</span>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl text-center min-w-[150px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
          <div className="flex items-center justify-center gap-2 text-2xl font-serif text-[#1F4D3E]">
            <Coins size={20} className="text-amber-500" />
            {userData.coins || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACTIVITY FEED */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <Sparkles className="text-purple-500" size={20} />
              <h2 className="font-serif text-lg">Aura Engagement</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tryons.length > 0 ? tryons.map((log) => (
                <div key={log.id} className="flex gap-4 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <img src={log.store_inventory?.image_url} className="w-12 h-16 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{log.store_inventory?.model_name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">
                      {log.action_type === 'booking_click' ? '📅 Booked' : '✨ Tried On'}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic p-4">No activity recorded yet.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <History className="text-blue-500" size={20} />
              <h2 className="font-serif text-lg">Financial Ledger</h2>
            </div>
            <div className="p-6 space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">{tx.description}</p>
                    <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: QUICK METRICS */}
        <div className="space-y-6">
          <div className="bg-[#1F4D3E] p-8 rounded-[2rem] text-white">
            <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-4">Engagement Score</h3>
            <p className="text-5xl font-serif">{(tryons.length * 1.5).toFixed(0)}</p>
            <p className="text-xs mt-4 opacity-70 leading-relaxed">Based on AI generations and boutique interaction frequency.</p>
          </div>
        </div>
      </div>
    </div>
  );
}