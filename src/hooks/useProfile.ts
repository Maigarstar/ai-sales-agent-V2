"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/* ================================
   TYPES
================================ */

export type Profile = {
  id: string;
  updated_at: string | null;
  full_name: string | null;
  phone_number: string | null;
  user_type: "vendor" | "couple" | "admin" | null;
  onboarding_complete: boolean | null;
  business_name: string | null;
  website: string | null;
  wedding_date: string | null;
  destination_preference: string | null;
  coins?: number;
};

type UseProfileResult = {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  signedIn: boolean;
  refresh: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

/* ================================
   SINGLETON CLIENT
================================ */

// Create once per module, not per render
const supabase = createBrowserSupabase();

/* ================================
   HOOK
================================ */

export function useProfile(): UseProfileResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setProfile(null);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("useProfile error:", err);
      setUserId(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    userId,
    profile,
    loading,
    signedIn: Boolean(userId),
    refresh: fetchProfile,
    refreshProfile: fetchProfile,
  };
}
