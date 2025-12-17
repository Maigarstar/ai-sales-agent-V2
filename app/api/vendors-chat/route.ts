import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/* ================================
   Force dynamic
================================ */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ================================
   Types
================================ */
type ChatMessage = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  name?: string;
  tool_call_id?: string;
};

type LeadMetadata = {
  score?: number;
  lead_type?: "Hot" | "Warm" | "Cold";
  business_category?: string | null;
  location?: string | null;
  client_budget?: string | null;
  follow_up_next_step?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;

  // Couples
  couple_destination?: string | null;
  couple_guest_count?: string | null;
  couple_style?: string | null;
  couple_date_or_season?: string | null;
  couple_needs?: string[] | null;

  // Vendors
  vendor_guest_capacity?: string | null;
  vendor_price_range?: string | null;
  vendor_style?: string | null;
  vendor_services?: string[] | null;
  vendor_marketing_goals?: string[] | null;

  source?: string | null;
  [key: string]: any;
};

/* ================================
   OpenAI client
================================ */
const apiKey = process.env.LIVE_OPENAI_KEY || process.env.OPENAI_API_KEY || "";
const client = new OpenAI({ apiKey });

/* ================================
   Supabase
================================ */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/* ================================
   Helpers
================================ */
function safeString(v: any) {
  return typeof v === "string" ? v : "";
}

function buildSystemPrompt(chatType: "vendor" | "couple") {
  if (chatType === "vendor") {
    return `
You are Aura, the AI Wedding Specialist for 5 Star Weddings, The Luxury Wedding Collection.

You are speaking to a wedding business or venue.

Your job:
1) Qualify them properly, for example business type, location, style, guest numbers, price range, goals.
2) Then guide the conversation into how we help: premium listing on 5starweddingdirectory.com, refined editorial on our blog, and Instagram strategy on @5starweddings, 144K followers.
3) Keep it business focused: marketing, SEO, Instagram content, positioning, enquiries.

Rules:
- Only reference 5starweddingdirectory.com, the 5starweddingdirectory.com blog, and @5starweddings.
- Do not mention LinkedIn metrics or staff names.
- Ask two to four sharp questions per turn and then wait.

When you need venues or vendors, call the tool search_directory with q, category, and location.

Response format:
First the natural reply.
Then one single <metadata> block that contains JSON only.

Metadata fields:
- business_category
- location
- vendor_guest_capacity
- vendor_price_range
- vendor_style
- vendor_services
- vendor_marketing_goals
- follow_up_next_step
- score
- lead_type

If unknown, set to null.
`.trim();
  }

  return `
You are Aura, the AI Wedding Specialist for 5 Star Weddings, The Luxury Wedding Collection.

You are speaking to a couple.

Your job:
1) Qualify them, for example destination, guest count, budget, date or season, style.
2) Recommend venues and vendors using only 5starweddingdirectory.com. If you need results, call search_directory.
3) Suggest which vendor categories they will need.

Rules:
- Only reference 5starweddingdirectory.com and the 5starweddingdirectory.com blog.
- If you are not sure of an exact venue page, do not invent it. Ask a narrowing question.
- Use Markdown formatting (bold, lists) for timelines, budgets, and recommendations.

Response format:
First the natural reply.
Then one single <metadata> block that contains JSON only.

Metadata fields:
- business_category must be "Couple"
- couple_destination
- couple_guest_count
- client_budget
- couple_style
- couple_date_or_season
- couple_needs
- follow_up_next_step
- score
- lead_type

If unknown, set to null.
`.trim();
}

/* ================================
   Tool definition shape for OpenAI
================================ */
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_directory",
      description:
        "Search curated listings on 5starweddingdirectory.com and return normalized results. Accepts q, category, location, page, pageSize.",
      parameters: {
        type: "object",
        properties: {
          q: { type: "string", description: "Free text such as 'band in Lake Como'." },
          category: {
            type: "string",
            description:
              "Optional category such as venue, planner, photographer, videographer, band, dj, florist, caterer, makeup, hair, stylist.",
          },
          location: { type: "string", description: "Optional place such as Lake Como, Tuscany, London." },
          page: { type: "number" },
          pageSize: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
];

/* ================================
   Directory bridge call
================================ */
async function callDirectoryBridge(reqUrl: string, args: any) {
  const origin = new URL(reqUrl).origin;
  const url = new URL(`${origin}/api/directory/search`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      q: args?.q ?? undefined,
      category: args?.category ?? undefined,
      location: args?.location ?? undefined,
      page: args?.page ?? 1,
      pageSize: args?.pageSize ?? 10,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(`Directory bridge failed ${res.status} ${data?.error || ""}`.trim());
  }
  return data;
}

/* ================================
   Tool loop with OpenAI
================================ */
async function runModelWithTools({
  systemPrompt,
  messages,
  reqUrl,
}: {
  systemPrompt: string;
  messages: ChatMessage[];
  reqUrl: string;
}) {
  // First call
  let chat = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [{ role: "system", content: systemPrompt }, ...messages] as any,
    tools,
    tool_choice: "auto",
  });

  // Tool loop
  for (let i = 0; i < 2; i++) {
    const choice = chat.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) break;

    const toolMessages: ChatMessage[] = [];

    for (const tc of toolCalls) {
      try {
        // ✅ FIX: Narrow the union before accessing tc.function
        if (tc.type === "function" && tc.function?.name === "search_directory") {
          const args = JSON.parse(tc.function.arguments ?? "{}");
          const result = await callDirectoryBridge(reqUrl, args);

          toolMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
            name: "search_directory",
          });
        }
      } catch (err: any) {
        toolMessages.push({
          role: "tool",
          tool_call_id: (tc as any).id,
          content: JSON.stringify({ ok: false, error: err?.message || "Directory search failed" }),
          name: "search_directory",
        });
      }
    }

    // Second call with tool outputs
    chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        chat.choices[0].message,
        ...toolMessages,
      ] as any,
      tools,
      tool_choice: "auto",
    });
  }

  return chat.choices?.[0]?.message?.content || "";
}

/* ================================
   Route Handler
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

    const chatType: "vendor" | "couple" =
      body.chatType === "vendor" || body.mode === "vendor" ? "vendor" : "couple";

    const organisationId: string = body.organisationId || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
    const agentId: string = body.agentId || "70660422-489c-4b7d-81ae-b786e43050db";

    let conversationId: string | null =
      typeof body.conversationId === "string" ? body.conversationId : null;

    if (messages.length === 0) {
      return NextResponse.json({ ok: false, error: "No messages supplied" }, { status: 400 });
    }

    if (!apiKey) {
      console.error("VENDORS CHAT ERROR: OpenAI key missing.");
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 500 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json({ ok: false, error: "No user message found" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(chatType);
    const fullContent = await runModelWithTools({ systemPrompt, messages, reqUrl: req.url });

    // Parse metadata
    let replyText = fullContent.trim();
    let metadata: LeadMetadata = {};

    const lower = fullContent.toLowerCase();
    const metaStart = lower.indexOf("<metadata>");
    const metaEnd = lower.indexOf("</metadata>");

    if (metaStart !== -1 && metaEnd !== -1 && metaEnd > metaStart) {
      replyText = fullContent.slice(0, metaStart).trim();
      const jsonBlock = fullContent.slice(metaStart + "<metadata>".length, metaEnd).trim();
      try {
        metadata = JSON.parse(jsonBlock);
      } catch (err) {
        console.error("Failed parsing metadata JSON", err);
        metadata = {};
      }
    }

    if (!replyText) replyText = fullContent.trim();

    // Defaults
    metadata.source = metadata.source || "web_chat";
    if (chatType === "couple") metadata.business_category = "Couple";

    // Supabase write
    const supabase = getSupabaseServerClient();
    let leadId: string | null = null;

    if (supabase) {
      if (!conversationId) {
        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .insert({
            organisation_id: organisationId,
            agent_id: agentId,
            user_type: chatType,
            status: "new",
            first_message: safeString(lastUserMessage.content),
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (convError) console.error("Create conversation error", convError);
        else if (conv) conversationId = conv.id as string;
      } else {
        await supabase
          .from("conversations")
          .update({
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      }

      const { data, error } = await supabase
        .from("vendor_leads")
        .insert({
          organisation_id: organisationId,
          agent_id: agentId,
          chat_type: chatType,
          source: metadata.source || "web_chat",
          raw_metadata: metadata,
          score: metadata.score ?? null,
          lead_type: metadata.lead_type ?? null,
          business_category: metadata.business_category ?? null,
          location: metadata.location ?? null,
          budget: metadata.client_budget ?? null,
          follow_up_next_step: metadata.follow_up_next_step ?? null,
          name: metadata.name ?? null,
          email: metadata.email ?? null,
          phone: metadata.phone ?? null,
          couple_destination: metadata.couple_destination ?? null,
          couple_guest_count: metadata.couple_guest_count ?? null,
          conversation_id: conversationId,
        })
        .select()
        .single();

      if (error) console.error("vendor_leads insert error", error.message);
      else if (data) leadId = data.id as string;
    }

    return NextResponse.json({
      ok: true,
      reply: replyText,
      metadata,
      lead_id: leadId,
      conversation_id: conversationId,
    });
  } catch (err: any) {
    console.error("VENDORS CHAT API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
