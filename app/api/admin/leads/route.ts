import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("vendor_leads")
      .select(
        `
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
        `
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("ADMIN LEADS SELECT ERROR:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      leads: data ?? [],
    });
  } catch (err: any) {
    console.error("ADMIN LEADS ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
