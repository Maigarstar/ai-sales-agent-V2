import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "Missing Supabase env vars in /api/admin/delete-conversation route"
    );
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const conversationId = body?.conversationId as string | undefined;

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversationId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase client not configured" },
        { status: 500 }
      );
    }

    // Delete related messages first (if those tables exist)
    const tablesToClean = ["messages", "conversation_messages"];

    for (const table of tablesToClean) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("conversation_id", conversationId);

      if (error) {
        const code = (error as any).code;

        // 42P01 = table does not exist, ignore
        if (code === "42P01") {
          console.warn(`Table ${table} not found, skipping`);
          continue;
        }

        console.error(`Error deleting from ${table}`, error);
      }
    }

    // Now delete the conversation
    const { error: convError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (convError) {
      console.error("Error deleting conversation", convError);
      return NextResponse.json(
        {
          ok: false,
          error:
            (convError as any).message || "Failed to delete this conversation",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("delete-conversation API error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
