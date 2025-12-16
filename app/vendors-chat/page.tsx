"use client";

import { Suspense } from "react";
import VendorsChatInner from "./VendorsChatInner";
import AuraVoice from "@/components/AuraVoice";

export default function VendorsChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <div className="flex flex-col gap-4">
        <AuraVoice />
        <VendorsChatInner />
      </div>
    </Suspense>
  );
}
