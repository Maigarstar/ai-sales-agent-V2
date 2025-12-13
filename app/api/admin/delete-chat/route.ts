import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role if it exists, otherwise fall back to anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase env vars are missing in delete chat route");
}

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase is not configured in delete chat" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const conversationId = body?.conversation_id as string | undefined;

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversation_id is required" },
        { status: 400 }
      );
    }

    // Delete messages linked to this conversation
    const { error: msgError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (msgError) {
      console.error("delete chat messages error", msgError);
      return NextResponse.json(
        {
          ok: false,
          error: msgError.message || "Failed to delete messages",
        },
        { status: 500 }
      );
    }

    // Then delete the conversation itself
    const { error: convError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (convError) {
      console.error("delete chat conversations error", convError);
      return NextResponse.json(
        {
          ok: false,
          error: convError.message || "Failed to delete conversation",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("delete chat route error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Server error in delete chat",
      },
      { status: 500 }
    );
  }
}
