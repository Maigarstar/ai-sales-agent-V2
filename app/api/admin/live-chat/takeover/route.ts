import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { conversationId, adminName } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversationId is required" },
        { status: 400 },
      );
    }

    const displayName = adminName || "Admin";

    // mark conversation as active human chat
    const { error } = await supabase
      .from("conversations")
      .update({
        live_status: "active",
        live_taken_over_by: displayName,
        live_last_admin_reply_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      console.error("live-chat takeover error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // optional system message in message history
    await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      role: "system",
      content: `${displayName} joined the chat.`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("live-chat takeover exception", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
