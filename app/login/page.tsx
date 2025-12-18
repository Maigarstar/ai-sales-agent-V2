"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function safePath(input: string | null) {
  if (!input) return null
  if (!input.startsWith("/")) return null
  if (input.startsWith("//")) return null
  return input
}

/**
 * 1. The Core Login Logic Component
 * This component safely uses useSearchParams()
 */
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const reg = searchParams.get("register")
    if (reg === "1") setIsRegistering(true)
  }, [searchParams])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !password) {
        alert("Enter email and password")
        return
      }

      const authRes = isRegistering
        ? await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          })
        : await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })

      if (authRes.error) {
        alert(authRes.error.message)
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

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) {
        router.replace("/admin")
        router.refresh()
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single()

      const isAdmin = !!profile?.is_admin

      if (intended.startsWith("/admin")) {
        router.replace(isAdmin ? "/admin/dashboard" : "/vendors-chat")
        router.refresh()
        return
      }

      router.replace(intended)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
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
          className="w-full py-4 bg-[#1F4D3E] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#163C30] transition-all disabled:opacity-60"
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
  )
}

/**
 * 2. The Main Page Component
 * This wraps the form in Suspense to fix the build error
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={
        <div className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
          <div className="h-4 w-32 bg-gray-100 rounded mx-auto" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}