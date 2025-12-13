// app/api/admin/vendor-chat-feed/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Service role only for admin routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as
  | string
  | undefined;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "[vendor-chat-feed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase is not configured with service role key",
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    // We ignore chatType filter for now to avoid relying on a chat_type column
    // This keeps the route robust even if the schema is still evolving.
    const url = new URL(req.url);
    const chatTypeParam = url.searchParams.get("chatType");
    console.log("[vendor-chat-feed] chatType =", chatTypeParam);

    // 1) Load recent conversations (select * to avoid unknown-column errors)
    const { data: convs, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (convError) {
      console.error("[vendor-chat-feed] conversations error", convError);
      return NextResponse.json(
        { ok: false, error: "Failed to load conversations" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!convs || convs.length === 0) {
      return NextResponse.json(
        { ok: true, messages: [] },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const conversationIds = convs.map((c: any) => c.id as string);
    const leadIds = convs
      .map((c: any) => c.lead_id as string | null)
      .filter((id): id is string => Boolean(id));

    // 2) Load messages for these conversations
    const { data: msgs, error: msgError } = await supabase
      .from("messages")
      .select("conversation_id, sender_type, content, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("[vendor-chat-feed] messages error", msgError);
      return NextResponse.json(
        { ok: false, error: "Failed to load messages" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 3) Load lead metadata from vendor_leads (select * again for safety)
    let leadsById: Record<string, any> = {};

    if (leadIds.length > 0) {
      const { data: leads, error: leadError } = await supabase
        .from("vendor_leads")
        .select("*")
        .in("id", leadIds);

      if (leadError) {
        console.error("[vendor-chat-feed] vendor_leads error", leadError);
      } else if (leads) {
        leadsById = leads.reduce((acc: any, lead: any) => {
          acc[lead.id] = lead;
          return acc;
        }, {});
      }
    }

    // 4) Group messages by conversation
    const messagesByConv: Record<
      string,
      { role: string; content: string }[]
    > = {};
    const lastUserByConv: Record<string, string> = {};
    const lastAssistantByConv: Record<string, string> = {};

    (msgs || []).forEach((m: any) => {
      const convId = m.conversation_id as string;

      if (!messagesByConv[convId]) {
        messagesByConv[convId] = [];
      }

      const role = m.sender_type === "user" ? "user" : "assistant";
      messagesByConv[convId].push({ role, content: m.content });

      if (role === "user") {
        lastUserByConv[convId] = m.content;
      } else {
        lastAssistantByConv[convId] = m.content;
      }
    });

    // 5) Shape rows exactly as AdminChatPage expects
    const rows = convs.map((c: any) => {
      const convId = c.id as string;
      const lead = c.lead_id ? leadsById[c.lead_id] || null : null;

      return {
        id: convId,
        created_at: c.created_at,
        messages: messagesByConv[convId] || [],
        metadata: lead || null,
        last_user_message: lastUserByConv[convId] || null,
        last_assistant_message: lastAssistantByConv[convId] || null,
        score: lead ? lead.score ?? null : null,
        lead_type: lead ? lead.lead_type ?? null : null,
        business_category: lead ? lead.business_category ?? null : null,
        location: lead ? lead.location ?? null : null,
        lead_status: lead ? lead.lead_status ?? null : null,
      };
    });

    return NextResponse.json(
      { ok: true, messages: rows },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[vendor-chat-feed] route error", err);
    return NextResponse.json(
      { ok: false, error: "Server error in vendor-chat-feed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
