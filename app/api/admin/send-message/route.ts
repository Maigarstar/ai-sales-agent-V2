import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Environment variables for server-side Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing for Admin Send Message route"
  );
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

// The sender type used by the admin/agent, which is likely 'agent'
// to satisfy the messages_sender_type_check constraint.
const ADMIN_SENDER_TYPE = "agent"; 
const CONVERSATION_STATUS_TAKEN_OVER = "admin_takeover"; 

interface SendMessageBody {
  conversation_id: string;
  message: string;
  // Optional: Used to identify the admin user taking over
  admin_user_id?: string;
}

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase is not configured with service role key" },
        { status: 500 }
      );
    }

    // Safely parse JSON body, preventing errors on empty body
    const body: SendMessageBody = await req.json().catch(() => ({}));
    const { conversation_id, message, admin_user_id } = body;

    if (!conversation_id || !message) {
      return NextResponse.json(
        { ok: false, error: "conversation_id and message are required" },
        { status: 400 }
      );
    }

    // --- 1. Insert the new message from the admin/agent ---
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation_id,
      sender_type: ADMIN_SENDER_TYPE, // Uses 'agent' to match database check
      content: message,
      // You may need to add an 'user_id' or 'agent_id' column here if it exists on your schema
    });

    if (msgError) {
      console.error("send-message insert error", msgError);
      return NextResponse.json(
        { ok: false, error: "Failed to insert admin message" },
        { status: 500 }
      );
    }

    // --- 2. Update the conversation status to signal admin takeover ---
    // The client-side code (in the chat component) should read this status
    // and stop the AI from responding.
    const { error: convUpdateError } = await supabase
      .from("conversations")
      .update({
        status: CONVERSATION_STATUS_TAKEN_OVER,
        // If your table has a field to track the active agent, update it here
        // active_agent_id: admin_user_id, 
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    if (convUpdateError) {
      console.error("send-message conversation update error", convUpdateError);
      // This is a warning, as the message was successfully sent
      // but we return success anyway.
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