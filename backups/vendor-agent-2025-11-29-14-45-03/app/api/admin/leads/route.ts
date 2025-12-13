import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient.js";

export async function GET() {
  const { data, error } = await supabase
    .from("vendor_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
