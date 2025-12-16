import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin"; // ✅ corrected path

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const body = await req.json();
    const { vendor_id } = body;

    if (!vendor_id) {
      return NextResponse.json(
        { ok: false, error: "Missing vendor_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_messages")
      .select("*")
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ ok: true, messages: data });
  } catch (err: any) {
    console.error("vendors-chat-feed error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
