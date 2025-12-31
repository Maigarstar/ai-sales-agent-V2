"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { X, Upload, Loader2, CheckCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid'; // Standard for unique filenames

export default function UploadModal({ onClose, onSaved, profile }: any) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    model_name: "",
    designer_name: "",
    category: "dress",
    booking_url: "",
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile?.id || loading) return; // Guard against double-clicks
    
    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Generate unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${uuidv4()}.${fileExt}`;
      
      // 2. Upload to 'inventory' bucket
      const { error: uploadError } = await supabase.storage
        .from('inventory')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inventory')
        .getPublicUrl(fileName);

      // 4. Atomic Insert
      const { error: dbError } = await supabase.from('store_inventory').insert({
        store_id: profile.id,
        image_url: publicUrl,
        ...formData,
        status: 'live' // Defaulting to live for immediate availability
      });

      if (dbError) throw dbError;

      setStatusMessage({ text: "Couture piece published successfully.", type: 'success' });
      
      // Delay closing to let the user see the success message
      setTimeout(() => {
        onSaved();
      }, 1500);

    } catch (err: any) {
      setStatusMessage({ text: err.message || "Upload failed. Please try again.", type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row border border-gray-100">
        
        {/* PREVIEW PANEL */}
        <div className="w-full md:w-5/12 bg-gray-50/50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
          {previewUrl ? (
            <div className="relative group w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => setFile(null)} className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4 w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-3xl hover:bg-white hover:border-[#1F4D3E]/40 transition-all group">
              <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                <ImageIcon className="text-gray-300 group-hover:text-[#1F4D3E]" size={36} />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-bold text-gray-600 font-sans">Drop couture photo</p>
                <p className="text-[10px] text-gray-400 font-sans uppercase tracking-widest mt-1 italic">Portrait mode works best</p>
              </div>
            </label>
          )}
          <input type="file" accept="image/*" className="hidden" id="file-upload" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>

        {/* FORM PANEL */}
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-serif text-3xl text-[#1F4D3E]">New Collection</h2>
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-[0.2em] mt-1">Inventory Management</p>
              </div>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors"><X size={28} /></button>
            </header>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Model Name</label>
                  <input required className="w-full p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl outline-none focus:border-[#1F4D3E] focus:bg-white transition-all font-sans text-sm" 
                    value={formData.model_name} onChange={e => setFormData({...formData, model_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Designer</label>
                  <input required className="w-full p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl outline-none focus:border-[#1F4D3E] focus:bg-white transition-all font-sans text-sm" 
                    value={formData.designer_name} onChange={e => setFormData({...formData, designer_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Boutique Booking URL</label>
                <input required type="url" placeholder="https://..." className="w-full p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl outline-none focus:border-[#1F4D3E] focus:bg-white transition-all font-sans text-sm" 
                  value={formData.booking_url} onChange={e => setFormData({...formData, booking_url: e.target.value})} />
              </div>

              <button 
                disabled={loading || !file} 
                className="w-full mt-6 py-4.5 bg-[#1F4D3E] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-[#163C30] disabled:opacity-40 shadow-xl shadow-[#1F4D3E]/10 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> Publish to Atelier</>}
              </button>
            </form>
          </div>

          {/* INLINE TOAST */}
          {statusMessage && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <p className="text-xs font-bold font-sans">{statusMessage.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}