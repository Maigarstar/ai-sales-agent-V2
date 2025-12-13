// app/api/admin/vendor-applications/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

// GET /api/admin/vendor-applications
// returns all applications for the admin list
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("vendor_applications")
      .select(
        "id, created_at, name, email, phone, business_name, status"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE LIST ERROR:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      applications: data ?? [],
    });
  } catch (err: any) {
    console.error("LIST API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
