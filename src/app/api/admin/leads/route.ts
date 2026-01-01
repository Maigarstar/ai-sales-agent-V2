import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(`
        id,
        created_at,
        chat_id,
        messages,
        metadata,
        last_user_message,
        last_assistant_message,
        score,
        lead_type,
        business_category,
        location,
        lead_status
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("ADMIN LEADS SELECT ERROR:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, leads: data ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("ADMIN LEADS ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
