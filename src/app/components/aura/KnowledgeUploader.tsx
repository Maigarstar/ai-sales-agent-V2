"use client";

import { useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";

export default function KnowledgeUploader() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  /* ---------------------------------
     ENV SAFETY
  ---------------------------------- */
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(envUrl && envKey);

  const supabase = useMemo(() => {
    if (!isConfigured) return null;
    return createBrowserClient(envUrl!, envKey!);
  }, [envUrl, envKey, isConfigured]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!supabase) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("knowledge-base")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Save reference to Database
      const { error: dbError } = await supabase
        .from("aura_knowledge_base")
        .insert({
          vendor_id: user.id,
          file_name: file.name,
          file_url: filePath,
          file_type: file.type,
        });

      if (dbError) throw dbError;

      setFiles((prev) => [
        ...prev,
        { name: file.name, status: "synced" },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div style={{ padding: 32, color: "#666" }}>
        Supabase is not configured for this environment.
      </div>
    );
  }

  return (
    <div style={uploaderCard}>
      <h3 style={sectionTitle}>Aura Knowledge Base</h3>
      <p style={description}>
        Upload brochures or PDFs to train your AI specialist.
      </p>

      <label style={dropZone}>
        <input
          type="file"
          hidden
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
        />

        {uploading ? (
          <Loader2 style={spin} className="animate-spin" />
        ) : (
          <Upload size={24} color="#C5A059" />
        )}

        <span style={uploadText}>
          {uploading
            ? "Training Aura..."
            : "Click to upload wedding documents"}
        </span>
      </label>

      <div style={fileList}>
        {files.map((file, i) => (
          <div key={i} style={fileRow}>
            <div style={fileInfo}>
              <FileText size={16} color="#4B5563" />
              <span style={fileName}>{file.name}</span>
            </div>
            <CheckCircle size={16} color="#10B981" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STYLING
   ========================================================= */
const uploaderCard = {
  backgroundColor: "#FFF",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #E5E7EB",
  marginTop: "32px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#183F34",
  marginBottom: "4px",
};

const description = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "20px",
};

const dropZone = {
  border: "2px dashed #E5E7EB",
  borderRadius: "12px",
  padding: "40px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const uploadText = {
  fontSize: "14px",
  color: "#183F34",
  fontWeight: "500",
};

const fileList = {
  marginTop: "20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "10px",
};

const fileRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
};

const fileInfo = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const fileName = {
  fontSize: "13px",
  color: "#374151",
};

const spin = { color: "#C5A059" };
