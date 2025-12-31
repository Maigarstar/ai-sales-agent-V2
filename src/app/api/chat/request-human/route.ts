import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversationId is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("conversations")
      .update({
        live_status: "requested",
        live_requested_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      console.error("request-human error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("request-human exception", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
