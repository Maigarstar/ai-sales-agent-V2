import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("SUPABASE ERROR get-vendor:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/leads/get-vendor error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
