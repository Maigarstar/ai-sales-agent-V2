"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StoreItem = {
  id: string;
  title: string | null;
  image_url: string | null;
  bucket: string | null;
};

type StudioOverlayProps = {
  open: boolean;
  onClose: () => void;
  spendCoins: (
    amount: number,
    description: string
  ) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  loadInventory: () => Promise<StoreItem[]>;
  generateVirtualTryOn: (args: {
    userImageFile: File;
    styleItem: StoreItem;
  }) => Promise<string>;
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

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(envUrl && envKey);

  const [step, setStep] = useState<"intro" | "upload" | "select" | "result">(
    "intro"
  );
  const [processing, setProcessing] = useState(false);
  const [inventory, setInventory] = useState<StoreItem[]>([]);
  const [activeBucket, setActiveBucket] = useState("All");
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ESC close */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /* Load inventory */
  useEffect(() => {
    if (!open || !isConfigured) return;
    let mounted = true;
    (async () => {
      try {
        const items = await loadInventory();
        if (mounted) setInventory(items || []);
      } catch {
        if (mounted) setInventory([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, loadInventory, isConfigured]);

  /* Reset */
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

    const spend = await spendCoins(
      coinCost,
      "Aura Styling Lab: Virtual Fitting"
    );
    if (!spend.ok) {
      setProcessing(false);
      alert(spend.error || "Insufficient balance.");
      return;
    }

    try {
      const url = await generateVirtualTryOn({
        userImageFile,
        styleItem: selectedItem,
      });
      setResultUrl(url);
      await refreshProfile();
      setStep("result");
    } catch {
      alert("Generation failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (!open) return null;

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center">
          <h2 className="text-xl font-serif text-[#1F4D3E] mb-2">
            Configuration Error
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Supabase environment variables are missing.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1F4D3E] text-white rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* rest of your JSX unchanged */
  return (
    <div className="fixed inset-0 z-[100]">
      {/* unchanged render */}
    </div>
  );
}
