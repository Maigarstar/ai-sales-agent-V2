import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// FIX: Add || "placeholder" so it doesn't crash during build
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { lead_id } = await req.json();

    if (!lead_id) {
      return NextResponse.json({ ok: false, error: "Missing lead_id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("vendor_leads")
      .delete()
      .eq("id", lead_id);

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}