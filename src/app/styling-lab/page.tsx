"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import StudioOverlay from "@/app/components/aura/StudioOverlay";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { useProfile } from "@/hooks/useProfile";
import { ensureAnonSession } from "@/lib/supabase/ensureAnonSession";

type StoreItem = {
  id: string;
  title: string | null;
  image_url: string | null;
  bucket: string | null;
};

export default function StylingLabPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const { profile, refreshProfile } = useProfile();

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const coinCost = 25;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const openStudio = useCallback(async () => {
    const ensured = await ensureAnonSession(supabase);
    if (!ensured.ok) {
      showToast("Please refresh, session could not start.");
      return;
    }

    await refreshProfile();
    setOpen(true);
  }, [supabase, refreshProfile, showToast]);

  const spendCoins = useCallback(
    async (amount: number, description: string) => {
      const ensured = await ensureAnonSession(supabase);
      if (!ensured.ok) {
        return { ok: false, error: "Session required." };
      }

      const { error } = await supabase.rpc("deduct_coins", {
        amount_to_deduct: amount,
        spend_description: description,
      });

      if (error) {
        return {
          ok: false,
          error: "Insufficient coins or transaction failed.",
        };
      }

      showToast("Session started, coins deducted.");
      return { ok: true };
    },
    [supabase, showToast]
  );

  const loadInventory = useCallback(async (): Promise<StoreItem[]> => {
    const { data, error } = await supabase
      .from("store_inventory")
      .select("id, title, image_url, bucket")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as StoreItem[];
  }, [supabase]);

  const generateVirtualTryOn = useCallback(
    async (args: { userImageFile: File; styleItem: StoreItem }) => {
      const ensured = await ensureAnonSession(supabase);
      if (!ensured.ok) {
        throw new Error("Session required.");
      }

      const form = new FormData();
      form.append("image", args.userImageFile);
      form.append("style_id", args.styleItem.id);

      const res = await fetch("/api/aura/try-on", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          json?.error ||
          json?.message ||
          "Generation failed. Please check your connection.";
        throw new Error(message);
      }

      if (!json?.result_url) {
        throw new Error("Missing result URL");
      }

      showToast("Your look is ready.");
      return json.result_url as string;
    },
    [supabase, showToast]
  );

  const coinsLabel = useMemo(() => {
    const c = (profile as any)?.coins ?? 0;
    return `${c} coins`;
  }, [profile]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#1F4D3E]/10">
      <div className="mx-auto max-w-5xl px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-5xl font-serif text-[#1F4D3E] tracking-tight">
              Aura Styling Lab
            </h1>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed font-light">
              Enter our private digital atelier. Experience high fidelity virtual couture fittings, powered by Aura AI.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Aura Wallet
              </p>
              <span className="text-xl font-serif text-[#1F4D3E]">
                {coinsLabel}
              </span>
            </div>

            <button
              onClick={openStudio}
              className="rounded-2xl bg-[#1F4D3E] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-xl shadow-[#1F4D3E]/20 hover:bg-[#163C30] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Enter Studio
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            className="text-sm text-gray-400 hover:text-[#1F4D3E] transition-colors flex items-center justify-center gap-2"
            href="/wedding-concierge"
          >
            <span>←</span> Back to Wedding Concierge
          </Link>
        </div>
      </div>

      <StudioOverlay
        open={open}
        onClose={() => setOpen(false)}
        spendCoins={spendCoins}
        refreshProfile={refreshProfile}
        loadInventory={loadInventory}
        generateVirtualTryOn={generateVirtualTryOn}
        coinCost={coinCost}
      />

      {toast && (
        <div className="fixed bottom-10 left-1/2 z-[200] -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#1F4D3E] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {toast}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
