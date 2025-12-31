import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing for vendor_leads API");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("vendor_leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("GET single vendor_lead error", error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 200 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Lead not found" },
          { status: 200 }
        );
      }

      return NextResponse.json({ ok: true, lead: data }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(
        `
        id,
        created_at,
        lead_type,
        score,
        business_category,
        location,
        client_budget,
        style,
        marketing_channels,
        last_vendor_message,
        follow_up_next_step,
        lead_status
      `
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("GET vendor_leads error", error);
      return NextResponse.json(
        { ok: false, error: error.message, leads: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, leads: data ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error("VENDOR_LEADS API GET ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error", leads: [] },
      { status: 200 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    const id = body?.id as string | undefined;
    const leadStatus = (body?.lead_status as string | undefined)?.toLowerCase();

    if (!id || !leadStatus) {
      return NextResponse.json(
        { ok: false, error: "id and lead_status are required" },
        { status: 200 }
      );
    }

    const allowed = [
      "new",
      "contacted",
      "in_progress",
      "won",
      "lost",
    ] as const;

    if (!allowed.includes(leadStatus as any)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid lead_status. Use one of new, contacted, in_progress, won, lost.",
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_leads")
      .update({ lead_status: leadStatus })
      .eq("id", id)
      .select(
        `
        id,
        created_at,
        lead_type,
        score,
        business_category,
        location,
        client_budget,
        style,
        marketing_channels,
        last_vendor_message,
        follow_up_next_step,
        lead_status
      `
      )
      .maybeSingle();

    if (error) {
      console.error("PATCH vendor_leads error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, lead: data }, { status: 200 });
  } catch (err: any) {
    console.error("VENDOR_LEADS API PATCH ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
