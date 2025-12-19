"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type StoreItem = {
  id: string;
  title: string | null;
  image_url: string | null;
  bucket: string | null;
};

type StudioOverlayProps = {
  open: boolean;
  onClose: () => void;
  spendCoins: (amount: number, description: string) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  loadInventory: () => Promise<StoreItem[]>;
  generateVirtualTryOn: (args: { userImageFile: File; styleItem: StoreItem }) => Promise<string>;
  coinCost?: number;
};

function classNames(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

export default function StudioOverlay(props: StudioOverlayProps) {
  const {
    open,
    onClose,
    spendCoins,
    refreshProfile,
    loadInventory,
    generateVirtualTryOn,
    coinCost = 25,
  } = props;

  // ✅ 1. SAFETY CHECK FOR ENVIRONMENT VARIABLES
  // This prevents the app from crashing in environments where vars aren't loaded yet
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(envUrl && envKey);

  // ✅ 2. SAFE SUPABASE CLIENT INITIALIZATION
  const supabase = useMemo(() => {
    if (!isConfigured) return null; 
    return createBrowserClient(envUrl!, envKey!);
  }, [isConfigured, envUrl, envKey]);

  const [step, setStep] = useState<"intro" | "upload" | "select" | "result">("intro");
  const [processing, setProcessing] = useState(false);
  const [inventory, setInventory] = useState<StoreItem[]>([]);
  const [activeBucket, setActiveBucket] = useState<string>("All");
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const dragRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Load inventory when opened
  useEffect(() => {
    if (!open || !isConfigured) return;
    let mounted = true;
    (async () => {
      try {
        const items = await loadInventory();
        if (!mounted) return;
        setInventory(items || []);
      } catch (err) {
        console.error("Inventory Load Error:", err);
        if (!mounted) return;
        setInventory([]);
      }
    })();
    return () => { mounted = false; };
  }, [open, loadInventory, isConfigured]);

  // Reset when closed
  useEffect(() => {
    if (open) return;
    setStep("intro");
    setProcessing(false);
    setSelectedItem(null);
    setResultUrl(null);
    if (userImageUrl) URL.revokeObjectURL(userImageUrl);
    setUserImageUrl(null);
    setUserImageFile(null);
    setActiveBucket("All");
  }, [open, userImageUrl]);

  const buckets = useMemo(() => {
    const s = new Set<string>();
    for (const it of inventory) if (it.bucket) s.add(it.bucket);
    return ["All", ...Array.from(s).sort()];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (activeBucket === "All") return inventory;
    return inventory.filter((i) => i.bucket === activeBucket);
  }, [inventory, activeBucket]);

  function onPickFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (userImageUrl) URL.revokeObjectURL(userImageUrl);
    setUserImageFile(file);
    setUserImageUrl(URL.createObjectURL(file));
    setStep("select");
  }

  async function startSessionAndGenerate() {
    if (!userImageFile || !selectedItem) return;
    setProcessing(true);

    const spend = await spendCoins(coinCost, "Aura Styling Lab: Virtual Fitting");
    if (!spend.ok) {
      setProcessing(false);
      alert(spend.error || "Insufficient balance. Please top up your wallet.");
      return;
    }

    try {
      const url = await generateVirtualTryOn({ userImageFile, styleItem: selectedItem });
      setResultUrl(url);
      await refreshProfile();
      setStep("result");
    } catch {
      alert("Generation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  // ✅ 3. EARLY RETURN LOGIC TO PREVENT BLANK SCREEN
  if (!open) return null;

  // Fallback UI if environment variables are missing
  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-serif text-[#1F4D3E] mb-2">Configuration Error</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Your Supabase environment variables are missing. Please ensure <b>.env.local</b> contains your URL and Anon Key, then restart your server.
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-[#1F4D3E] text-white rounded-xl font-bold hover:bg-[#163C30] transition-colors"
          >
            Close Laboratory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => !processing && onClose()} />

      <div className="absolute inset-0 p-3 sm:p-6 flex items-center justify-center">
        <div className="h-full w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden relative flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-serif text-[#1F4D3E]">Aura Styling Lab</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Digital Atelier v1.0</p>
            </div>
            <button 
              onClick={onClose} 
              disabled={processing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {step === "intro" && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="mb-8 inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-16 h-16 bg-[#FDFCFB] rounded-xl flex items-center justify-center border border-[#1F4D3E]/10">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <h3 className="text-3xl font-serif text-[#1F4D3E] mb-4">Start Your Fitting</h3>
                <p className="text-gray-600 mb-10 leading-relaxed">
                  Upload a photo of yourself and select a couture piece from our boutique partners to begin the AI synthesis.
                </p>
                <button 
                  onClick={() => setStep("upload")}
                  className="px-10 py-4 bg-[#1F4D3E] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Enter Upload Phase
                </button>
              </div>
            )}

            {/* Step: Upload */}
            {step === "upload" && (
              <div className="max-w-xl mx-auto text-center py-12">
                 <div 
                  className="border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-white cursor-pointer hover:border-[#1F4D3E]/30 transition-colors"
                  onClick={() => inputRef.current?.click()}
                 >
                    <input 
                      type="file" 
                      ref={inputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])} 
                    />
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-700">Drop your photo here</p>
                    <p className="text-sm text-gray-400 mt-1">PNG or JPG up to 10MB</p>
                 </div>
              </div>
            )}

            {/* Step: Select */}
            {step === "select" && (
              <div className="space-y-8">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {buckets.map(b => (
                    <button
                      key={b}
                      onClick={() => setActiveBucket(b)}
                      className={classNames(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                        activeBucket === b ? "bg-[#1F4D3E] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredInventory.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={classNames(
                        "group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all",
                        selectedItem?.id === item.id ? "border-[#1F4D3E] ring-4 ring-[#1F4D3E]/5" : "border-transparent bg-white"
                      )}
                    >
                      <img src={item.image_url || ""} alt={item.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedItem && (
                  <div className="sticky bottom-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between rounded-t-3xl shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                        <img src={selectedItem.image_url || ""} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1F4D3E]">{selectedItem.title}</p>
                        <p className="text-xs text-gray-500">Ready for synthesis</p>
                      </div>
                    </div>
                    <button
                      onClick={startSessionAndGenerate}
                      disabled={processing}
                      className="px-8 py-3 bg-[#1F4D3E] text-white rounded-full font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                      {processing ? "Processing..." : "Apply Style (25 Coins)"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === "result" && resultUrl && (
              <div className="max-w-xl mx-auto py-8">
                <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                  <img src={resultUrl} className="w-full h-auto" alt="AI Generated Result" />
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-serif text-[#1F4D3E] mb-2">Synthesis Complete</h3>
                    <p className="text-gray-500 text-sm mb-6">Your couture look is ready for the digital stage.</p>
                    <button 
                      onClick={() => setStep("intro")}
                      className="text-[#1F4D3E] font-bold text-sm underline underline-offset-4"
                    >
                      Try Another Style
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}