import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// FIX 1: Use NEXT_PUBLIC_SUPABASE_URL (matching your .env file)
// FIX 2: Add || 'fallback' so it never crashes the build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// The sender type used by the admin/agent
const ADMIN_SENDER_TYPE = "agent"; 
const CONVERSATION_STATUS_TAKEN_OVER = "admin_takeover"; 

interface SendMessageBody {
  conversation_id: string;
  message: string;
  admin_user_id?: string;
}

export async function POST(req: Request) {
  try {
    // Safely parse JSON body
    const body: SendMessageBody = await req.json().catch(() => ({}));
    const { conversation_id, message, admin_user_id } = body;

    if (!conversation_id || !message) {
      return NextResponse.json(
        { ok: false, error: "conversation_id and message are required" },
        { status: 400 }
      );
    }

    // --- 1. Insert the new message ---
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation_id,
      sender_type: ADMIN_SENDER_TYPE,
      content: message,
    });

    if (msgError) {
      console.error("send-message insert error", msgError);
      return NextResponse.json(
        { ok: false, error: "Failed to insert admin message" },
        { status: 500 }
      );
    }

    // --- 2. Update the conversation status ---
    const { error: convUpdateError } = await supabase
      .from("conversations")
      .update({
        status: CONVERSATION_STATUS_TAKEN_OVER,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    if (convUpdateError) {
      console.error("send-message conversation update error", convUpdateError);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("send-message route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in admin/send-message route" },
      { status: 500 }
    );
  }
}