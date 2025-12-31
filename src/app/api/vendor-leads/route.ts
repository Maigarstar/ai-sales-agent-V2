import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase settings missing for vendor_leads feed", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });

      return NextResponse.json(
        { leads: [], error: "Supabase env vars missing" },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("vendor_leads")
      .select(
        "id, created_at, source, session_id, last_message, score, lead_type, business_category, location, client_budget, follow_up_next_step"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Supabase vendor_leads feed error", error);
      return NextResponse.json(
        { leads: [], error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { leads: data ?? [], error: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("VENDOR LEADS API ERROR:", err);

    return NextResponse.json(
      { leads: [], error: err?.message || "unknown error" },
      { status: 200 }
    );
  }
}
