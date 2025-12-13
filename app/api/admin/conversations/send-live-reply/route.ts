import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role so admin replies are not blocked by RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!serviceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const conversationId = body?.conversationId as string | undefined;
    const message = body?.message as string | undefined;

    if (!conversationId || !message || !message.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing conversationId or message" },
        { status: 400 }
      );
    }

    const text = message.trim();

    // Check conversation exists
    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .single();

    if (convoError || !convo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            convoError?.message ||
            "Conversation not found for this conversationId",
        },
        { status: 404 }
      );
    }

    // Insert message into conversation_messages
    // Make sure the table has columns:
    // id, conversation_id, role, content, created_at
    const { error: insertError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        role: "admin", // or "assistant_human" if you prefer
        content: text,
      });

    if (insertError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            insertError.message ||
            "Could not insert admin message into conversation_messages",
        },
        { status: 500 }
      );
    }

    // Update conversation header
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        last_message: text,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            updateError.message ||
            "Message saved but could not update conversations row",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("send-live-reply route error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unexpected error sending live reply",
      },
      { status: 500 }
    );
  }
}
