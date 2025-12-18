import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizeUserType(v: unknown): "vendor" | "couple" {
  if (v === "vendor") return "vendor";
  return "couple";
}

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to start a chat." },
        { status: 401 }
      );
    }

    const user = auth.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type, full_name, phone_number")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: "Profile not found, please complete onboarding." },
        { status: 400 }
      );
    }

    const conversationId = crypto.randomUUID();

    const insertRow = {
      id: conversationId,
      user_id: user.id,
      user_type: normalizeUserType(profile?.user_type),
      status: "new",
      contact_name: profile?.full_name ?? null,
      contact_phone: profile?.phone_number ?? null,
      contact_email: user.email ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("conversations")
      .insert(insertRow);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, conversationId }, { status: 200 });
  } catch (e: any) {
    console.error("Server Error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
