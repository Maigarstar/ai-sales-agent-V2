import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing in vendor-leads/detail route"
  );
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

// --------------------------------------------------
// GET  /api/admin/vendor-leads/detail?id=UUID
// --------------------------------------------------
export async function GET(req: Request) {
  try {
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
        { ok: false, error: "id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(
        `
          id,
          created_at,
          chat_type,
          source,
          score,
          lead_type,
          business_category,
          location,
          budget,
          follow_up_next_step,
          name,
          email,
          phone,
          lead_status,
          couple_destination,
          couple_guest_count,
          internal_note,
          raw_chat_messages
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("vendor-leads/detail GET error", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to load lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data }, { status: 200 });
  } catch (err: any) {
    console.error("vendor-leads/detail GET route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in vendor-leads/detail GET" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PATCH  /api/admin/vendor-leads/detail
// Body: { id, lead_status, follow_up_next_step, internal_note }
// --------------------------------------------------
export async function PATCH(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { id, lead_status, follow_up_next_step, internal_note } = body || {};

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};
    if (typeof lead_status === "string") updatePayload.lead_status = lead_status;
    if (typeof follow_up_next_step === "string")
      updatePayload.follow_up_next_step = follow_up_next_step;
    if (typeof internal_note === "string")
      updatePayload.internal_note = internal_note;

    const { data, error } = await supabase
      .from("vendor_leads")
      .update(updatePayload)
      .eq("id", id)
      .select(
        `
          id,
          lead_status,
          follow_up_next_step,
          internal_note
        `
      )
      .single();

    if (error) {
      console.error("vendor-leads/detail PATCH error", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data }, { status: 200 });
  } catch (err: any) {
    console.error("vendor-leads/detail PATCH route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in vendor-leads/detail PATCH" },
      { status: 500 }
    );
  }
}
