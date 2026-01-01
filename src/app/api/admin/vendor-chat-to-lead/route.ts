import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error("Supabase admin client not initialized");
    }

    const body = await req.json();
    const { chat } = body;

    if (!chat || !chat.id) {
      return NextResponse.json(
        { ok: false, error: "Missing chat object or chat id" },
        { status: 400 }
      );
    }

    const {
      id: chat_id,
      messages,
      metadata,
      last_user_message,
      last_assistant_message,
      score,
      lead_type,
      business_category,
      location,
    } = chat;

    const { data, error } = await supabase
      .from("vendor_leads")
      .insert({
        chat_id,
        messages,
        metadata,
        last_user_message,
        last_assistant_message,
        score,
        lead_type,
        business_category,
        location,
        lead_status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("vendor_chat_to_lead insert error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (err: any) {
    console.error("vendor_chat_to_lead route error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
