import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { conversationId, message, adminName } = await req.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { ok: false, error: "conversationId and message are required" },
        { status: 400 },
      );
    }

    const displayName = adminName || "Admin";

    const { error: insertError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        role: "admin",
        content: message,
      });

    if (insertError) {
      console.error("live-chat reply insert error", insertError);
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        last_message: message,
        updated_at: new Date().toISOString(),
        live_status: "active",
        live_taken_over_by: displayName,
        live_last_admin_reply_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      console.error("live-chat reply update error", updateError);
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("live-chat reply exception", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
