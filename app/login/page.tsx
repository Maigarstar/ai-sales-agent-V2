'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const redirect = searchParams.get('redirectedFrom') || '/admin'
      router.push(redirect)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 shadow-lg rounded-xl w-full max-w-sm border border-gray-200"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Admin Login
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border border-gray-300 p-2 w-full mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="border border-gray-300 p-2 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white ${
            loading ? 'bg-green-900/70' : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
        )}
      </form>
    </div>
  )
}
