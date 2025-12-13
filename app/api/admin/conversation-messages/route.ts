import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// GET /api/admin/conversation-messages?conversation_id=...
export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !serviceKey) {
      console.error("Supabase URL or service role key missing in conversation-messages route");
      return NextResponse.json(
        { ok: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversation_id is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1. Conversation row
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, created_at, lead_id, channel, status")
      .eq("id", conversationId)
      .single();

    if (convError) {
      console.error("conversation-messages conversation error", convError);
      return NextResponse.json(
        { ok: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // 2. Messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("id, sender_type, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("conversation-messages messages error", msgError);
      return NextResponse.json(
        { ok: false, error: "Failed to load messages" },
        { status: 500 }
      );
    }

    // 3. Lead metadata, if any
    let lead = null;
    if (conversation.lead_id) {
      const { data: leadRow, error: leadError } = await supabase
        .from("leads")
        .select(
          "id, score, lead_type, business_category, location, lead_status"
        )
        .eq("id", conversation.lead_id)
        .single();

      if (leadError) {
        console.error("conversation-messages lead error", leadError);
      } else {
        lead = leadRow;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        conversation,
        lead,
        messages: messages || [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("conversation-messages route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in conversation-messages" },
      { status: 500 }
    );
  }
}
