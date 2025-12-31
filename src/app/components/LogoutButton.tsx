"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// ✅ FIXED: Changed the import to match the actual export in lib/supabase/client.ts
import { createClient } from "src/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  // ✅ FIXED: Initialize using createClient()
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium text-gray-600 hover:text-[#1F4D3E] transition-colors"
    >
      Sign Out
    </button>
  );
}