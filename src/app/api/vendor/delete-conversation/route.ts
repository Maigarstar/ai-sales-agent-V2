import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser style client, you will rely on RLS on conversations table
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId = body?.conversation_id as string | undefined;

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversation_id is required" },
        { status: 400 }
      );
    }

    // Optional, if you store vendor_id on the conversation, include it in the filter too
    // and let RLS enforce ownership

    const { error: msgError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (msgError) {
      console.error("vendor delete messages error", msgError);
      return NextResponse.json(
        { ok: false, error: msgError.message || "Failed to delete messages" },
        { status: 500 }
      );
    }

    const { error: convError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (convError) {
      console.error("vendor delete conversation error", convError);
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
    console.error("vendor delete route error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error in vendor delete" },
      { status: 500 }
    );
  }
}
