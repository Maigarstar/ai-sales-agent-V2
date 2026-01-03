import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function VendorsChatPage() {
  // ✅ MUST await the Supabase client
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // If not onboarded, show a block instead of the chat
  if (!profile?.onboarding_completed) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "Gilda Display, serif",
            color: "#183F34",
          }}
        >
          Feature Locked
        </h2>

        <p style={{ color: "#666", margin: "20px 0" }}>
          To use the AI Concierge, please complete your vendor onboarding first.
        </p>

        <Link
          href="/vendors/onboarding"
          style={{
            backgroundColor: "#183F34",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Go to Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "Gilda Display, serif",
          color: "#183F34",
        }}
      >
        AI Concierge
      </h1>

      {/* Existing Chat Interface Logic Goes Here */}
    </div>
  );
}
