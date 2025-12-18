"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  // Initialize the browser-side Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    // 1. Sign out from Supabase
    await supabase.auth.signOut();
    
    // 2. Refresh the current page to clear server-side state/cookies
    router.refresh();
    
    // 3. Redirect to the home page
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-2xl transition-all w-full"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}