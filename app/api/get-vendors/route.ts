import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function GET() {
  const { data, error } = await supabase
    .from("vendor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}
