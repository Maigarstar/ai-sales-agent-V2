import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { id, lead_status } = await req.json();

    if (!id || !lead_status) {
      return NextResponse.json(
        { ok: false, error: "id and lead_status are required" },
        { status: 400 }
      );
    }

    // find conversation for this chat
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("lead_id")
      .eq("id", id)
      .single();

    if (convError || !conv) {
      console.error("vendor-chat-status conversation error", convError);
      return NextResponse.json(
        { ok: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (!conv.lead_id) {
      // no lead yet, nothing to update
      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update({ lead_status })
      .eq("id", conv.lead_id);

    if (updateError) {
      console.error("vendor-chat-status update error", updateError);
      return NextResponse.json(
        { ok: false, error: "Failed to update lead status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("vendor-chat-status route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in vendor-chat-status" },
      { status: 500 }
    );
  }
}
