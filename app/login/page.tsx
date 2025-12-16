"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    // CHANGE: 'bg-white' on mobile, 'sm:bg-gray-50' on desktop.
    <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your AI sales agent and leads.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* CHANGE: Remove shadow/border on mobile. Add them back on 'sm:' screens */}
        <div className="bg-white py-8 px-6 shadow-none sm:shadow sm:rounded-xl sm:px-10 border-0 sm:border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                {/* CHANGE: text-base prevents iOS zoom on focus */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1F4D3E] focus:border-[#1F4D3E] text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1F4D3E] focus:border-[#1F4D3E] text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[#1F4D3E] hover:text-[#163C30]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#1F4D3E] hover:bg-[#163C30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}