import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/* ---------------------------------
   ADMIN: GET ALL VENDOR LEADS
---------------------------------- */
export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin client not configured" },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("vendor_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[vendor_leads] Supabase error:", error);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data ?? [],
    });
  } catch (err: any) {
    console.error("[vendor_leads] Fatal error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
