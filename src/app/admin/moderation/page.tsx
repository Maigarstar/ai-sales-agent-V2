"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";

export default function AdminModerationPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPending() {
      const { data, error } = await supabase
        .from("store_inventory")
        .select("id, image_url, title, designer_name, profiles(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (!error && data) setPendingItems(data);
      setLoading(false);
    }

    loadPending();
  }, [supabase]);

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("store_inventory")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1F4D3E]" size={32} />
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#1F4D3E] text-white rounded-2xl">
          <CheckCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-serif text-[#1F4D3E]">Moderation Queue</h1>
          <p className="text-sm text-gray-500 italic uppercase tracking-widest">
            Pending Approvals • 5 Star Wedding Concierge
          </p>
        </div>
      </div>

      {/* MODERATION TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {pendingItems.length === 0 ? (
          <div className="p-20 text-center text-gray-400 font-sans italic">
            All clear! No pending items for review.
          </div>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all"
            >
              <div className="flex items-center gap-6">
                <Image
                  src={item.image_url || "/placeholder.jpg"}
                  width={80}
                  height={110}
                  alt={item.title || "Item"}
                  className="rounded-xl border border-gray-100 shadow-sm object-cover"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500">
                    Designer: {item.designer_name}
                  </p>
                  <p className="text-[10px] font-bold text-[#1F4D3E] uppercase tracking-tighter">
                    Store: {item.profiles?.full_name || "Partner Boutique"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleModerate(item.id, "rejected")}
                  className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <XCircle size={28} />
                </button>
                <button
                  onClick={() => handleModerate(item.id, "approved")}
                  className="p-3 bg-[#1F4D3E] text-white hover:bg-[#163C30] rounded-2xl shadow-lg shadow-[#1F4D3E]/20 transition-all"
                >
                  <CheckCircle size={28} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
