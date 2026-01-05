import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeTitleFromText(text: string) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[`"'“”]/g, "")
    .trim();

  if (!clean) return "New conversation";

  const cut = clean.length > 56 ? clean.slice(0, 56) + "…" : clean;
  return cut;
}

function isDefaultTitle(title: any) {
  const t = String(title || "").trim().toLowerCase();
  if (!t) return true;
  return t === "new conversation" || t === "new chat" || t === "legacy conversation";
}

async function inferTitleFromFirstUserMessage(supabase: any, threadId: string) {
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("thread_id", threadId)
    .eq("role", "user")
    .order("created_at", { ascending: true })
    .limit(1);

  const first = data?.[0]?.content;
  if (!first) return null;

  return makeTitleFromText(first);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const url = new URL(req.url);
    const chatType = url.searchParams.get("chatType");

    let q = supabase
      .from("threads")
      .select("id,title,chat_type,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (chatType) q = q.eq("chat_type", chatType);

    const { data: threads, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const list = Array.isArray(threads) ? threads : [];

    const enriched = await Promise.all(
      list.map(async (t: any) => {
        const needsTitle = isDefaultTitle(t?.title);

        if (!needsTitle) return t;

        const inferred = await inferTitleFromFirstUserMessage(supabase, t.id).catch(() => null);
        if (!inferred) return t;

        // Persist, best effort
        try {
          await supabase.from("threads").update({ title: inferred }).eq("id", t.id);
        } catch {
          // ignore
        }

        return { ...t, title: inferred };
      })
    );

    return NextResponse.json({ ok: true, threads: enriched }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "threads_failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await req.json().catch(() => ({} as any));

    const chat_type = String(body?.chatType || body?.chat_type || "couple");
    const title = String(body?.title || "").trim();

    const { data: created, error } = await supabase
      .from("threads")
      .insert({
        chat_type,
        title: title ? makeTitleFromText(title) : "New conversation",
      })
      .select("id,title,chat_type,created_at,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, thread: created }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "create_thread_failed" },
      { status: 500 }
    );
  }
}
