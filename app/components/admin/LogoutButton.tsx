"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
    >
      <LogOut size={20} />
      <span>{loading ? "Signing out..." : "Log out"}</span>
    </button>
  );
}