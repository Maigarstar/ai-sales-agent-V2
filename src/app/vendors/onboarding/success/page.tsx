"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function OnboardingSuccessPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completeOnboarding = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      setLoading(false);

      setTimeout(() => {
        router.push("/vendors/chat");
      }, 1200);
    };

    completeOnboarding();
  }, [router, supabase]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F8F6",
        fontFamily: "Nunito Sans, sans serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "60px",
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontFamily: "Gilda Display, serif",
            fontSize: "32px",
            color: "#183F34",
            marginBottom: "12px",
          }}
        >
          You are all set
        </h1>

        <p style={{ color: "#666", fontSize: "15px" }}>
          Aura is preparing your concierge experience.
        </p>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#999" }}>
          {loading ? "Finalising setup…" : "Redirecting…"}
        </p>
      </div>
    </div>
  );
}
