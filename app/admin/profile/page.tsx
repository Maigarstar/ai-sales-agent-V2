"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { Camera, Lock, Mail, User as UserIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 1. Fetch User Data on Load
  useEffect(() => {
    const getUser = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        // Get avatar from metadata if it exists
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  // 2. Handle Image Upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // A. Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // B. Get Public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // C. Save URL to User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(urlData.publicUrl);
      setMessage("Profile picture updated!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Password Update
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
        {/* LEFT COLUMN: User Info & Avatar */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100 h-fit">
          <div className="flex flex-col items-center mb-6">
            
            {/* AVATAR UPLOAD AREA */}
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50 shadow-inner bg-gray-100 flex items-center justify-center relative">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-gray-400" />
                )}
                
                {/* Upload Overlay (Visible on Hover) */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
                
                {/* Loading Spinner */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-[#1F4D3E]" size={24} />
                  </div>
                )}
              </div>
              
              {/* The Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-2">Click image to upload</p>
            <h2 className="text-lg font-semibold text-gray-900 mt-4">Admin User</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
             <div className="text-sm text-gray-600">
                <span className="font-medium">User ID:</span> 
                <code className="block mt-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 break-all">
                  {user?.id}
                </code>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Change Password */}
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