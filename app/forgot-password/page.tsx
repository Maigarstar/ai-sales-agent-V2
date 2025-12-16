"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Check your email for the password reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-none sm:shadow sm:rounded-xl sm:px-10 border-0 sm:border border-gray-100">
          <form className="space-y-6" onSubmit={handleReset}>
            
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#1F4D3E] hover:bg-[#163C30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] transition-colors disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-[#1F4D3E] hover:text-[#163C30]">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}