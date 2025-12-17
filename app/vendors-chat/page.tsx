"use client";

import { Suspense } from "react";
import VendorsChatInner from "./VendorsChatInner";

export default function VendorsChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <VendorsChatInner />
    </Suspense>
  );
}
