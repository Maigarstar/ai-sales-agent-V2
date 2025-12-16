import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, vendors: data });
  } catch (err: any) {
    console.error("get-vendors error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
