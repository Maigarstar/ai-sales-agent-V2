import { NextResponse } from "next/server";
import OpenAI from "openai";

import isVendorIntent from "src/lib/intent/isVendorIntent";
import { handleAtlasChat } from "src/lib/atlas/handleAtlasChat";
import { getEdirectoryHighlights } from "src/lib/edirectory/getHighlights";
import { isReadyForHighlights } from "src/lib/edirectory/isReadyForHighlights";

import { createServerSupabase } from "src/lib/supabase/server";

/* ---------------------------------
   CHAT META TYPE
---------------------------------- */
type ChatMeta = {
  flow: "atlas" | "aura";
  stage?: "discovery" | "qualification" | "recommendation";
  intent?: "vendor" | "couple";
};

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function safeTitleFromMessage(text: string) {
  const t = String(text || "").trim();
  if (!t) return "New conversation";
  return t.length > 60 ? t.slice(0, 60) : t;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const message = String(body?.message || "").trim();
    const threadIdFromClient = String(body?.threadId || "").trim();

    if (!message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    const user = userRes?.user;

    if (userErr || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    /* -------------------------------
       Decide flow first
    -------------------------------- */
    const vendor = isVendorIntent(message);
    const flow: ChatMeta["flow"] = vendor ? "atlas" : "aura";
    const intent: ChatMeta["intent"] = vendor ? "vendor" : "couple";

    /* -------------------------------
       Ensure thread exists and belongs to user
    -------------------------------- */
    let threadId = threadIdFromClient;

    if (threadId) {
      const { data: ownedThread } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!ownedThread?.id) {
        threadId = "";
      }
    }

    if (!threadId) {
      const chatType = vendor ? "business" : "couple";

      const { data: newThread, error: threadErr } = await supabase
        .from("threads")
        .insert({
          user_id: user.id,
          title: safeTitleFromMessage(message),
          chat_type: chatType,
        })
        .select("id")
        .single();

      if (threadErr || !newThread?.id) {
        return NextResponse.json(
          { ok: false, error: threadErr?.message || "Thread create failed" },
          { status: 500 }
        );
      }

      threadId = newThread.id;
    }

    /* -------------------------------
       Save user message
    -------------------------------- */
    const userMeta: ChatMeta = vendor
      ? { flow: "atlas", intent: "vendor", stage: "qualification" }
      : { flow: "aura", intent: "couple", stage: "discovery" };

    const { data: savedUserMsg, error: insUserErr } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        user_id: user.id,
        role: "user",
        content: message,
        meta: userMeta,
      })
      .select("id,created_at")
      .single();

    if (insUserErr) {
      return NextResponse.json({ ok: false, error: insUserErr.message }, { status: 500 });
    }

    /* -------------------------------
       VENDOR → ATLAS
    -------------------------------- */
    if (vendor) {
      const atlas = await handleAtlasChat(message);

      const meta: ChatMeta = {
        flow: "atlas",
        intent: "vendor",
        stage: "qualification",
      };

      const { data: savedAsst, error: insAsstErr } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          user_id: user.id,
          role: "assistant",
          content: atlas.reply,
          meta,
        })
        .select("id,role,content,meta,created_at")
        .single();

      if (insAsstErr || !savedAsst) {
        return NextResponse.json(
          { ok: false, error: insAsstErr?.message || "Assistant save failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        threadId,
        reply: atlas.reply,
        listings: [],
        meta,
        messageIds: {
          user: savedUserMsg?.id,
          assistant: savedAsst.id,
        },
      });
    }

    /* -------------------------------
       B2C → AURA
    -------------------------------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `
You are Aura, a refined luxury wedding concierge.
Never mention AI.
Ask clarifying questions before recommending venues.
Speak with elegance and calm authority.
`,
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "Tell me a little more about what you are envisioning.";

    /* -------------------------------
       EDIRECTORY (OPTIONAL)
    -------------------------------- */
    let listings: any[] = [];
    let stage: ChatMeta["stage"] = "discovery";

    if (isReadyForHighlights(reply)) {
      listings = await getEdirectoryHighlights({});
      stage = "recommendation";
    }

    const meta: ChatMeta = {
      flow: "aura",
      intent: "couple",
      stage,
    };

    const { data: savedAsst, error: insAsstErr } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        user_id: user.id,
        role: "assistant",
        content: reply,
        meta,
      })
      .select("id,role,content,meta,created_at")
      .single();

    if (insAsstErr || !savedAsst) {
      return NextResponse.json(
        { ok: false, error: insAsstErr?.message || "Assistant save failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      threadId,
      reply,
      listings,
      meta,
      messageIds: {
        user: savedUserMsg?.id,
        assistant: savedAsst.id,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      ok: false,
      reply: "Let us continue.",
      listings: [],
    });
  }
}
