import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Use service role for admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing in lead-ai-insights route"
  );
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase admin client is not configured" },
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
      console.error("lead-ai-insights vendor_leads error", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to load lead" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, lead: data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("lead-ai-insights route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in lead-ai-insights" },
      { status: 500 }
    );
  }
}
