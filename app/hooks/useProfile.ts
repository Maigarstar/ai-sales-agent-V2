"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  updated_at: string | null;
  full_name: string | null;
  phone_number: string | null;
  user_type: "vendor" | "couple" | "admin" | null; // Added admin for safety
  onboarding_complete: boolean | null;
  business_name: string | null;
  website: string | null;
  wedding_date: string | null;
  destination_preference: string | null;
  coins?: number; // Added to support the Styling Lab balance
};

type UseProfileResult = {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  signedIn: boolean;
  refresh: () => Promise<void>;
  refreshProfile: () => Promise<void>; // ✅ Added for Styling Lab compatibility
};

export function useProfile(): UseProfileResult {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback to prevent unnecessary re-renders in effects
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user ?? null;

      if (!user) {
        setUserId(null);
        setProfile(null);
        setLoading(false);
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
    } catch {
      setUserId(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return {
    userId,
    profile,
    loading,
    signedIn: !!userId,
    refresh: fetchProfile,
    refreshProfile: fetchProfile, // ✅ Pointing to the same function
  };
}