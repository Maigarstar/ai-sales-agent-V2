"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // ✅ FIXED import for client-side use

type StoreItem = {
  id: string;
  title: string | null;
  image_url: string | null;
  bucket: string | null;
};

type StudioOverlayProps = {
  open: boolean;
  onClose: () => void;

  // Wallet
  spendCoins: (amount: number, description: string) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;

  // Inventory
  loadInventory: () => Promise<StoreItem[]>;

  // Generation
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

  // ✅ Fixed Supabase Client for Client Components
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

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

  // ✅ Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // ✅ Load inventory when opened
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const items = await loadInventory();
        if (!mounted) return;
        setInventory(items);
      } catch {
        if (!mounted) return;
        setInventory([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, loadInventory]);

  // ✅ Reset when closed
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

  // ✅ Dynamic bucket filtering
  const buckets = useMemo(() => {
    const s = new Set<string>();
    for (const it of inventory) if (it.bucket) s.add(it.bucket);
    return ["All", ...Array.from(s).sort()];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (activeBucket === "All") return inventory;
    return inventory.filter((i) => i.bucket === activeBucket);
  }, [inventory, activeBucket]);

  // ✅ Handle upload
  function onPickFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (userImageUrl) URL.revokeObjectURL(userImageUrl);
    setUserImageFile(file);
    setUserImageUrl(URL.createObjectURL(file));
    setStep("select");
  }

  // ✅ Apply style
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

  if (!open) return null;

  // ✅ Main UI (unchanged, already perfect)
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/55" onClick={() => !processing && onClose()} />

      <div className="absolute inset-0 p-3 sm:p-6">
        <div className="mx-auto h-full w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden relative">
          {/* ... rest of your UI unchanged ... */}
        </div>
      </div>
    </div>
  );
}
