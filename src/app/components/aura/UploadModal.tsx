"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  X,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const supabase = createBrowserSupabase();

export default function UploadModal({ onClose, onSaved, profile }: any) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    model_name: "",
    designer_name: "",
    category: "dress",
    booking_url: "",
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile?.id || loading) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("inventory")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inventory").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("store_inventory").insert({
        store_id: profile.id,
        image_url: publicUrl,
        ...formData,
        status: "live",
      });

      if (dbError) throw dbError;

      setStatusMessage({
        text: "Couture piece published successfully.",
        type: "success",
      });

      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        text: err.message || "Upload failed. Please try again.",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        {/* PREVIEW */}
        <div className="w-full md:w-5/12 bg-gray-50/50 p-8 flex items-center justify-center border-r border-gray-100">
          {previewUrl ? (
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
              <img src={previewUrl} className="w-full h-full object-cover" />
              <button
                onClick={() => setFile(null)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-3xl"
            >
              <ImageIcon size={36} className="text-gray-300" />
            </label>
          )}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* FORM */}
        <div className="flex-1 p-10">
          <form onSubmit={handleUpload} className="space-y-5">
            <input
              required
              placeholder="Model name"
              className="w-full p-3 border rounded-xl"
              value={formData.model_name}
              onChange={(e) =>
                setFormData({ ...formData, model_name: e.target.value })
              }
            />

            <input
              required
              placeholder="Designer"
              className="w-full p-3 border rounded-xl"
              value={formData.designer_name}
              onChange={(e) =>
                setFormData({ ...formData, designer_name: e.target.value })
              }
            />

            <input
              required
              type="url"
              placeholder="Booking URL"
              className="w-full p-3 border rounded-xl"
              value={formData.booking_url}
              onChange={(e) =>
                setFormData({ ...formData, booking_url: e.target.value })
              }
            />

            <button
              disabled={loading || !file}
              className="w-full py-4 bg-[#1F4D3E] text-white rounded-2xl font-bold"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Publish"}
            </button>
          </form>

          {statusMessage && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm font-bold ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
