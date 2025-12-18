"use client";

import { Share2, Bookmark, Calendar, ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ResultViewProps {
  generatedImageUrl: string;
  selectedDress: any;
  onReset: () => void;
  profile: any;
}

export default function ResultView({ generatedImageUrl, selectedDress, onReset, profile }: ResultViewProps) {
  
  const handleSaveLook = async () => {
    if (!profile?.id) {
      alert("Please log in to save your look.");
      return;
    }

    const { error } = await supabase.from('saved_looks').insert({
      user_id: profile.id,
      image_url: generatedImageUrl,
      dress_name: selectedDress?.model_name || "Bespoke Gown",
      store_id: selectedDress?.store_id
    });

    if (error) {
      console.error("Save error:", error);
      alert("We couldn't save your look at this moment. Please try again.");
    } else {
      alert("Look saved to your couture gallery!");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `my-aura-look-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Aura Virtual Fitting',
          text: `I just envisioned myself in this ${selectedDress?.model_name || 'gown'}!`,
          url: generatedImageUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      navigator.clipboard.writeText(generatedImageUrl);
      alert("Link copied to clipboard for sharing.");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-700">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest font-sans">Vision Perfected</span>
        </div>

        <h3 className="text-3xl font-serif text-[#1F4D3E]">Your Aura Look</h3>
        
        <p className="text-sm text-gray-500 font-sans leading-relaxed">
          The <strong>{selectedDress?.model_name || "selected piece"}</strong> has been digitally tailored to your silhouette. 
        </p>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <button 
            onClick={() => {
              const trackedUrl = `/api/redirect?storeId=${selectedDress?.store_id}&targetUrl=${selectedDress?.booking_url}&userId=${profile?.id}`;
              window.open(trackedUrl, '_blank');
            }}
            className="w-full py-4 bg-[#1F4D3E] text-white rounded-2xl font-bold font-sans hover:bg-[#163C30] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1F4D3E]/20"
          >
            <Calendar size={18} />
            Book Boutique Fitting
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleSaveLook} className="flex flex-col items-center justify-center gap-1 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-700 hover:bg-gray-50">
              <Bookmark size={16} /> Save
            </button>
            <button onClick={handleDownload} className="flex flex-col items-center justify-center gap-1 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-700 hover:bg-gray-50">
              <Download size={16} /> Get Image
            </button>
            <button onClick={handleShare} className="flex flex-col items-center justify-center gap-1 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-700 hover:bg-gray-50">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#1F4D3E] transition-colors pt-4 font-sans"
        >
          <ArrowLeft size={14} /> Try another couture piece
        </button>
      </div>
    </div>
  );
}