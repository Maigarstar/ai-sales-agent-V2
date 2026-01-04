import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

function makeTitleFromText(text: string) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[\u2018\u2019\u201C\u201D"'`]/g, "")
    .trim();

  if (!clean) return "Conversation";
  if (clean.length <= 56) return clean;
  return clean.slice(0, 56) + "…";
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabase();
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({} as any));
    const title = makeTitleFromText(String(body?.title || ""));

    const { error } = await supabase
      .from("threads")
      .update({ title })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || "update_failed") }, { status: 400 });
    }

    return NextResponse.json({ ok: true, title });
  } catch {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }
}
