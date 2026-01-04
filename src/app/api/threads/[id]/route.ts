import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const raw = String(body?.title || "").trim();
    const title = raw.slice(0, 80);

    if (!id || !title) {
      return NextResponse.json({ ok: false, error: "Missing id or title" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("threads")
      .update({ title })
      .eq("id", id)
      .select("id,title,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, thread: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
