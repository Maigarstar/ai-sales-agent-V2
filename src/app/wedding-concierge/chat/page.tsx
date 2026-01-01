"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import ConciergeLoginGate from "../components/ConciergeLoginGate";
import AuraRefinedChat from "./AuraRefinedChat";

const DISABLE_ONBOARDING =
  process.env.NEXT_PUBLIC_DISABLE_ONBOARDING === "true" ||
  process.env.NODE_ENV === "development";

export default function WeddingConciergeChatPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // DEV MODE: skip auth and onboarding
    if (DISABLE_ONBOARDING) {
      setSession({ user: { id: "dev-user" } });
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-[#183F34]">
        Initialising concierge…
      </div>
    );
  }

  // Production auth gate
  if (!session && !DISABLE_ONBOARDING) {
    return <ConciergeLoginGate onAuthed={(s) => setSession(s)} />;
  }

  // Live concierge experience
  return <AuraRefinedChat />;
}
