"use client";

import { Suspense } from "react";
import WeddingConciergeInner from "./WeddingConciergeInner";

export default function WeddingConciergePage() {
  return (
    <Suspense fallback={<div>Loading wedding concierge...</div>}>
      <WeddingConciergeInner />
    </Suspense>
  );
}
