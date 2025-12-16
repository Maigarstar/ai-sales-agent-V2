"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Lock, Mail } from "lucide-react";

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch User on Load
  useEffect(() => {
    const getUser = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, []);

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated successfully.");
      (e.target as HTMLFormElement).reset();
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sans">
        My Profile
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info Card */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-50 rounded-full text-[#1F4D3E]">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
              <p className="text-sm text-gray-500">Your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center gap-2 text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Mail size={16} className="text-gray-400" />
                <span>{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <code className="block text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 break-all">
                {user?.id}
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
              <div className="text-sm text-gray-600">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-50 rounded-full text-[#1F4D3E]">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {message && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm border border-green-200">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#1F4D3E] focus:border-[#1F4D3E] sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#163C30] focus:outline-none transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}