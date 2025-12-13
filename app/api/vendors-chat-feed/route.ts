import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase settings missing for vendors chat feed", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });

      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("vendor_chat_messages")
      .select("id, created_at, role, content")
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("Supabase feed error", error);
      return NextResponse.json(
        { messages: [], error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { messages: data ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("VENDORS CHAT FEED API ERROR:", err);

    return NextResponse.json(
      { messages: [], error: err?.message || "unknown error" },
      { status: 200 }
    );
  }
}
