"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { Camera, Mail, User as UserIcon, Globe, Phone, MapPin, Lock, Loader2, Building2 } from "lucide-react";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load user details
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
        setLogoUrl(data.user.user_metadata?.company_logo || null);
      }
    };
    getUser();
  }, []);

  // Upload avatar or company logo
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "logo") => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop();
      const fileName = `${type}-${user?.id}-${Date.now()}.${ext}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      await supabase.auth.updateUser({
        data: { [type === "avatar" ? "avatar_url" : "company_logo"]: publicUrl },
      });

      if (type === "avatar") setAvatarUrl(publicUrl);
      else setLogoUrl(publicUrl);

      setMessage(`${type === "avatar" ? "Profile" : "Company logo"} updated successfully!`);
    } catch (e: any) {
      setMessage("Upload failed. Please try again.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-[Nunito_Sans] text-gray-800">
      <h1 className="text-3xl font-[Playfair_Display] text-[#183F34] mb-8">
        Admin Profile
      </h1>

      {/* Section 1 — Profile Overview */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#E6E6E6] shadow-inner bg-gray-100 flex items-center justify-center relative">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={112} height={112} className="object-cover rounded-full" />
              ) : (
                <UserIcon size={44} className="text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="text-white" size={22} />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-[#183F34]" size={22} />
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "avatar")} className="absolute inset-0 opacity-0" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#183F34]">
              {user?.user_metadata?.full_name || "Administrator"}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={14} /> {user?.email}
            </p>
            <p className="text-sm text-gray-500 mt-1">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Section 2 — Company Information */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <Building2 className="text-[#183F34]" size={22} />
          <h2 className="text-xl font-[Gilda_Display] text-[#183F34]">Company Branding</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group cursor-pointer">
            <div className="w-40 h-20 bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt="Company Logo" width={160} height={80} className="object-contain" />
              ) : (
                <span className="text-gray-400 text-sm">Upload Logo</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "logo")} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>

          <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Company Name</label>
              <input type="text" placeholder="5 Star Weddings" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Website</label>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <input type="text" placeholder="https://5starweddingdirectory.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <input type="text" placeholder="+44 7960 497211" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Address</label>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <input type="text" placeholder="87 Serpentine Close, Hertfordshire, UK" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Security */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <Lock className="text-[#183F34]" size={20} />
          <h2 className="text-xl font-[Gilda_Display] text-[#183F34]">Security Settings</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Update your password for account protection.
        </p>

        <form className="grid sm:grid-cols-3 gap-4">
          <input type="password" placeholder="New Password" className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
          <input type="password" placeholder="Confirm Password" className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-[#183F34]" />
          <button type="submit" className="bg-[#183F34] text-white rounded-lg px-4 py-2 hover:bg-[#122C24]">
            Update Password
          </button>
        </form>
      </div>

      {/* Section 4 — Billing Info (Future Integration) */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-[Gilda_Display] text-[#183F34] mb-2">Billing & Subscription</h2>
        <p className="text-sm text-gray-500">Coming soon — Manage your subscription, invoices, and payments here.</p>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 mt-10">
        © 2026 5 Star Weddings — Concierge Platform. Powered by Taigenic AI.
      </footer>
    </div>
  );
}
