import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// FORCE DYNAMIC
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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

const apiKey =
  process.env.LIVE_OPENAI_KEY || process.env.OPENAI_API_KEY || "dummy-key";

const client = new OpenAI({ apiKey });

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

function getSupabaseServerClient() {
  if (
    supabaseUrl === "https://placeholder.supabase.co" ||
    !supabaseServiceKey ||
    supabaseServiceKey === "placeholder-key"
  ) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

function safeString(v: any) {
  return typeof v === "string" ? v : "";
}

function buildSystemPrompt(chatType: "vendor" | "couple") {
  if (chatType === "vendor") {
    return `
You are Aura, the AI Wedding Specialist for 5 Star Weddings, The Luxury Wedding Collection.

You are speaking to a wedding business or venue.

Your job:
1) Qualify them properly (venue or business type, location, style, guest numbers, price range, and what they want more of).
2) Then guide the conversation into how we help: premium listing on 5starweddingdirectory.com, refined editorial on our blog, and Instagram strategy on @5starweddings (144K followers).
3) Keep it business focused: marketing, SEO, Instagram content, positioning, and enquiries.

Important rules:
- Do not recommend or reference any websites except 5starweddingdirectory.com, the 5starweddingdirectory.com blog, and @5starweddings on Instagram.
- Do not mention LinkedIn metrics.
- Do not mention staff names.
- Ask 2 to 4 smart questions per turn, not a long list, then wait.

Response format requirement:
First write a natural reply for the vendor, no tags.
Then output metadata JSON only inside one <metadata> block.

Metadata fields:
- business_category: for example Venue, Planner, Photographer, Videographer, Music, Florist, Catering, Styling, Other
- location: city, region, country if known
- vendor_guest_capacity: a short string if known
- vendor_price_range: minimum spend, starting from, or typical range if known
- vendor_style: classic, modern, editorial, cultural, beach, countryside, château, palace, villa, resort, etc
- vendor_services: array if known
- vendor_marketing_goals: array if known, for example more destination couples, more winter weddings, more weekend buyouts
- follow_up_next_step: short string, for example "Send listing options", "Request media kit", "Share editorial examples"
- score and lead_type: your best estimate

If unknown, set fields to null.

Example:
Thank you for reaching out, reply text.

<metadata>
{ "score": 60, "lead_type": "Warm", ... }
</metadata>
`.trim();
  }

  return `
You are Aura, the AI Wedding Specialist for 5 Star Weddings, The Luxury Wedding Collection.

You are speaking to a couple planning a wedding.

Your job:
1) Qualify them properly (destination, guest count, budget range, date or season, style).
2) Then recommend venues and vendors using only 5starweddingdirectory.com.
3) Also recommend which vendor categories they need: planner, photographer, videographer, music, styling, flowers.

Important rules:
- Do not recommend or reference any websites except 5starweddingdirectory.com and the 5starweddingdirectory.com blog.
- If you are not sure of an exact venue page, do not invent it. Ask a question to narrow the shortlist.
- Ask 2 to 4 smart questions per turn, then wait.

Response format requirement:
First write a natural reply for the couple, no tags.
Then output metadata JSON only inside one <metadata> block.

Metadata fields:
- business_category must be "Couple"
- couple_destination
- couple_guest_count
- client_budget
- couple_style
- couple_date_or_season
- couple_needs: array, for example ["planner","photographer","videographer"]
- follow_up_next_step: short string, for example "Shortlist venues from our collection"
- score and lead_type: your best estimate

If unknown, set fields to null.

Example:
Thank you for your message, reply text.

<metadata>
{ "score": 55, "lead_type": "Warm", "business_category": "Couple", ... }
</metadata>
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

    const chatType: "vendor" | "couple" =
      body.chatType === "vendor" || body.mode === "vendor" ? "vendor" : "couple";

    const organisationId: string =
      body.organisationId || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
    const agentId: string =
      body.agentId || "70660422-489c-4b7d-81ae-b786e43050db";

    let conversationId: string | null =
      typeof body.conversationId === "string" ? body.conversationId : null;

    if (messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No messages supplied" },
        { status: 400 }
      );
    }

    if (!apiKey || apiKey.startsWith("dummy")) {
      console.error("VENDORS CHAT ERROR: OpenAI key missing or invalid.");
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing or invalid" },
        { status: 500 }
      );
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json(
        { ok: false, error: "No user message found" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(chatType);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // Parse reply and metadata
    let replyText = fullContent.trim();
    let metadata: LeadMetadata = {};

    const lower = fullContent.toLowerCase();
    const metaStart = lower.indexOf("<metadata>");
    const metaEnd = lower.indexOf("</metadata>");

    if (metaStart !== -1 && metaEnd !== -1 && metaEnd > metaStart) {
      replyText = fullContent.slice(0, metaStart).trim();

      const jsonBlock = fullContent
        .slice(metaStart + "<metadata>".length, metaEnd)
        .trim();

      try {
        metadata = JSON.parse(jsonBlock);
      } catch (err) {
        console.error("Failed parsing metadata JSON", err);
        metadata = {};
      }
    }

    if (!replyText) replyText = fullContent.trim();

    // Hard set a couple defaults so the DB stays consistent
    metadata.source = metadata.source || "web_chat";
    if (chatType === "couple") metadata.business_category = "Couple";

    // Supabase save pipeline
    const supabase = getSupabaseServerClient();
    let leadId: string | null = null;

    if (supabase) {
      // Conversations table
      if (!conversationId) {
        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .insert({
            organisation_id: organisationId,
            agent_id: agentId,
            user_type: chatType, // vendor or couple, keep it consistent
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

        if (convError) {
          console.error("Create conversation error", convError);
        } else if (conv) {
          conversationId = conv.id as string;
        }
      } else {
        const { error: convUpdateError } = await supabase
          .from("conversations")
          .update({
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        if (convUpdateError) {
          console.error("Update conversation error", convUpdateError);
        }
      }

      // Optional transcript insert is still commented, keep it that way until table is confirmed.

      // Leads table
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

      if (error) {
        console.error("vendor_leads insert error", error.message);
      } else if (data) {
        leadId = data.id as string;
      }
    }

    return NextResponse.json({
      ok: true,
      reply: replyText,
      metadata,
      lead_id: leadId,
      conversation_id: conversationId,
    });
  } catch (err: any) {
    console.error("VENDORS-CHAT API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
