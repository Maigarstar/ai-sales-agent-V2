"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

function safePath(input: string | null) {
  if (!input) return null
  if (!input.startsWith("/")) return null
  if (input.startsWith("//")) return null
  return input
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowserClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isRegistering
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              // optional, but recommended so email links bring users back to your site
              emailRedirectTo: `${window.location.origin}/login`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        alert(error.message)
        return
      }

      if (isRegistering) {
        router.replace("/onboarding")
        router.refresh()
        return
      }

      const nextParam = safePath(searchParams.get("next"))
      const redirectedFrom = safePath(searchParams.get("redirectedFrom"))
      const intended = nextParam || redirectedFrom || "/admin"

      // Get the signed in user
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      // If we cannot read user, fall back safely
      if (!userId) {
        router.replace("/admin")
        router.refresh()
        return
      }

      // Check admin flag
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single()

      const isAdmin = !!profile?.is_admin

      // Decide redirect
      if (intended.startsWith("/admin")) {
        router.replace(isAdmin ? intended : "/vendors-chat")
        router.refresh()
        return
      }

      // Normal redirect
      router.replace(intended)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-[#1F4D3E] font-serif text-3xl mb-2">5 Star Weddings</h1>
          <p className="text-gray-500 text-sm">Luxury Concierge Access</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#1F4D3E] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#1F4D3E] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-[#1F4D3E] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#163C30] transition-all"
          >
            {loading ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
            <ArrowRight size={18} />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-6 text-sm text-gray-500 hover:text-[#1F4D3E]"
        >
          {isRegistering ? "Already have an account? Sign In" : "New to 5 Star? Create an Account"}
        </button>
      </div>
    </div>
  )
}
