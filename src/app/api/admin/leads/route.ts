import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(`
        id,
        created_at,
        metadata,
        location,
        score,
        lead_type,
        lead_status
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("ADMIN LEADS FETCH ERROR:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        leads: data ?? []
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("ADMIN LEADS ROUTE CRASH:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unexpected server error"
      },
      { status: 500 }
    );
  }
}
