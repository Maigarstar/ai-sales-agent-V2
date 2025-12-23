"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Package, ExternalLink, Trash2, Edit3, Loader2, Info } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import UploadModal from "@/components/aura/UploadModal";

export default function StoreInventoryPage() {
  const { profile, loading: profileLoading } = useProfile();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from("store_inventory")
        .select("*")
        .eq("store_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error) setInventory(data);
      setIsLoading(false);
    }
    loadInventory();
  }, [profile]);

  // 1. Permission Gate
  if (profileLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline" /></div>;
  if (profile?.user_type !== "vendor") {
    return <div className="p-20 text-center font-serif text-gray-400">Access Restricted to Partner Boutiques.</div>;
  }

  // 2. Secure Delete Logic
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this piece from the Aura Closet?")) return;
    
    setDeletingId(id);
    const { error } = await supabase.from("store_inventory").delete().eq("id", id);
    
    if (error) {
      console.error(error);
      setMessage("Failed to delete item. Please try again.");
    } else {
      setInventory(prev => prev.filter(item => item.id !== id));
      setMessage("Piece removed from your Aura Closet.");
    }
    
    setDeletingId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[#1F4D3E]">Couture Inventory</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#1F4D3E] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#163C30] transition-all"
        >
          <Plus size={20} /> Add New Piece
        </button>
      </div>

      {/* INVENTORY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventory.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${deletingId === item.id ? "opacity-50 blur-[1px]" : "hover:shadow-lg"}`}
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-gray-50">
              <img src={item.image_url} alt={item.model_name} className="object-cover w-full h-full" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button 
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white/90 backdrop-blur rounded-lg text-gray-400 hover:text-red-500 shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-900 truncate">{item.model_name}</h4>
              <p className="text-xs text-gray-500">{item.designer_name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SUCCESS/ERROR TOAST */}
      {message && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1F4D3E] text-white rounded-2xl px-6 py-3 shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Info size={18} />
          {message}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <UploadModal 
          profile={profile}
          onClose={() => setShowModal(false)} 
          onSaved={() => {
            setShowModal(false);
            window.location.reload(); // Simple refresh to show new item
          }} 
        />
      )}
    </div>
  );
}