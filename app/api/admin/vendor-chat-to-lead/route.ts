import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chat } = body; // this is the chat row you send from the frontend

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
      .insert([
        {
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
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("vendor_chat_to_lead insert error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (err: any) {
    console.error("vendor_chat_to_lead route error", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
