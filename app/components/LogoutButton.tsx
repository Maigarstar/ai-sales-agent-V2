"use client"

import { useRouter } from "next/navigation"
// ✅ FIXED: Using the standardized import name
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  // ✅ FIXED: Initialize using createClient()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium text-gray-600 hover:text-[#1F4D3E] transition-colors"
    >
      Sign Out
    </button>
  )
}