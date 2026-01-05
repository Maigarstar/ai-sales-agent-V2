import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();

  const body = await req.json().catch(() => ({} as any));
  const threadId = String(body?.threadId || "").trim();

  if (!threadId) {
    return NextResponse.json({ ok: false, error: "Missing threadId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("thread_shares")
    .insert({ thread_id: threadId })
    .select("token")
    .single();

  if (error || !data?.token) {
    return NextResponse.json({ ok: false, error: error?.message || "Share create failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    token: data.token,
    path: `/share/${data.token}`,
  });
}
