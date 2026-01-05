import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;

  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("thread_shares")
    .select("thread_id, revoked, expires_at")
    .eq("token", token)
    .single();

  if (error || !data?.thread_id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (data.revoked) {
    return NextResponse.json({ ok: false, error: "Revoked" }, { status: 410 });
  }

  if (data.expires_at) {
    const exp = new Date(String(data.expires_at)).getTime();
    if (!Number.isNaN(exp) && exp <= Date.now()) {
      return NextResponse.json({ ok: false, error: "Expired" }, { status: 410 });
    }
  }

  const origin = new URL(req.url).origin;

  const mRes = await fetch(`${origin}/api/threads/${data.thread_id}/messages`, {
    method: "GET",
    cache: "no-store",
  });

  if (!mRes.ok) {
    return NextResponse.json({ ok: false, error: "Messages fetch failed" }, { status: 500 });
  }

  const mData = await mRes.json().catch(() => ({} as any));
  const messages = Array.isArray(mData?.messages) ? mData.messages : [];

  return NextResponse.json({
    ok: true,
    threadId: data.thread_id,
    messages,
  });
}
