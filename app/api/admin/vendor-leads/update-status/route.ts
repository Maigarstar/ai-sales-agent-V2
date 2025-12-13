import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "won",
  "lost",
];

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid id or status" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase env for update lead status", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });

      return NextResponse.json(
        { ok: false, error: "Supabase settings missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("vendor_leads")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) {
      console.error("Supabase update lead status error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, lead: data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("UPDATE LEAD STATUS API ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "unknown error",
      },
      { status: 500 }
    );
  }
}
