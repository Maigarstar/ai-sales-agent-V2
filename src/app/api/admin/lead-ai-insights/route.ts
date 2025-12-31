import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin"; // fixed path

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
    const leadId = url.searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json(
        { ok: false, error: "lead_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(
        `
          id,
          created_at,
          score,
          lead_type,
          business_category,
          location,
          raw_metadata,
          raw_chat_messages
        `
      )
      .eq("id", leadId)
      .single();

    if (error) {
      console.error("lead-ai-insights vendor_leads error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to load lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data }, { status: 200 });
  } catch (err: any) {
    console.error("lead-ai-insights route error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error in lead-ai-insights" },
      { status: 500 }
    );
  }
}
