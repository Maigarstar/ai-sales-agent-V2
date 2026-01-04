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

function needsAutoTitle(title: any) {
  const t = String(title || "").trim().toLowerCase();
  if (!t) return true;
  if (t === "new chat") return true;
  if (t === "new conversation") return true;
  if (t === "legacy conversation") return true;
  if (t === "conversation") return true;
  return false;
}

async function autoTitleThreadsIfNeeded(supabase: any, threads: any[]) {
  const targets = threads.filter((t) => needsAutoTitle(t?.title)).slice(0, 20);
  if (!targets.length) return threads;

  await Promise.all(
    targets.map(async (t) => {
      try {
        const { data: rows, error: mErr } = await supabase
          .from("messages")
          .select("content")
          .eq("thread_id", t.id)
          .eq("role", "user")
          .order("created_at", { ascending: true })
          .limit(1);

        if (mErr) return;

        const first = String(rows?.[0]?.content || "").trim();
        if (!first) return;

        const nextTitle = makeTitleFromText(first);

        const { error: uErr } = await supabase
          .from("threads")
          .update({ title: nextTitle })
          .eq("id", t.id);

        if (!uErr) t.title = nextTitle;
      } catch {
        // ignore
      }
    })
  );

  return threads;
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: threads, error } = await supabase
      .from("threads")
      .select("id,title,chat_type,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || "threads_failed"), threads: [] }, { status: 400 });
    }

    const list = Array.isArray(threads) ? threads : [];
    const titled = await autoTitleThreadsIfNeeded(supabase, list);

    return NextResponse.json({ ok: true, threads: titled });
  } catch {
    return NextResponse.json({ ok: false, threads: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await req.json().catch(() => ({} as any));

    const chatType = String(body?.chatType || "couple");
    const title = String(body?.title || "New conversation");

    const { data, error } = await supabase
      .from("threads")
      .insert({ chat_type: chatType, title })
      .select("id,title,chat_type,created_at,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || "create_failed") }, { status: 400 });
    }

    const { data: threads } = await supabase
      .from("threads")
      .select("id,title,chat_type,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      ok: true,
      thread: data,
      threads: Array.isArray(threads) ? threads : [],
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
