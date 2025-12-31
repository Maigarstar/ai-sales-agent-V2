'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from 'src/lib/supabase/client';

export default function ProfileAvatarUpload({ userId }: { userId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl.publicUrl);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', userId);
    } catch (error) {
      alert('Upload failed.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <label style={{ cursor: 'pointer' }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '1px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
            }}
          >
            Upload
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
