import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// FIX 1: Add || "placeholder" so the build doesn't crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

// FIX 2: Remove the "throw new Error" block. We let createClient handle it safely.
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    // Safety check that only runs at runtime, not build time
    if (supabaseUrl === "https://placeholder.supabase.co") {
        return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
    }

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
          error: "Conversation not found",
        },
        { status: 404 }
      );
    }

    // FIX 3: Use the correct table ('messages') and column ('sender_type')
    // matching your other files.
    const { error: insertError } = await supabase
      .from("messages") // Was 'conversation_messages'
      .insert({
        conversation_id: conversationId,
        sender_type: "admin", // Was 'role'
        content: text,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { ok: false, error: "Could not insert admin message" },
        { status: 500 }
      );
    }

    // Update conversation header
    // Note: 'last_message' might not exist in your schema based on previous files.
    // If this fails, you can remove the .update() block safely.
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        // last_message: text, // Uncomment if your table actually has this column
        status: "in_progress",
        // updated_at: new Date().toISOString(), // Uncomment if you have this
      })
      .eq("id", conversationId);

    if (updateError) {
      console.error("Update error:", updateError);
      // We don't fail the request here because the message was sent successfully
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