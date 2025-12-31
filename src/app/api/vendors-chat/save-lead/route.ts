import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// ==============================
// OPENAI CLIENT
// ==============================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==============================
// SUPABASE SERVER CLIENT
// ==============================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables");
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages = body.messages;
    const chatType: "vendor" | "couple" =
      body.chatType === "couple" ? "couple" : "vendor";

    const organisationId =
      body.organisationId || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
    const agentId =
      body.agentId || "70660422-489c-4b7d-81ae-b786e43050db";

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No messages supplied" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    // ==============================
    // SYSTEM PROMPT
    // ==============================
    const baseIntro =
      chatType === "couple"
        ? `You are the Wedding Concierge for 5 Star Weddings.

You speak to couples who are planning weddings and honeymoons and are searching for luxury venues, planners and vendors.`
        : `You are the AI Vendor Qualification Assistant for 5 Star Weddings.

You speak to wedding venues, hotels and vendors who want more high value enquiries from international couples.`;

    const systemPrompt = `
${baseIntro}

EVERY SINGLE RESPONSE MUST FOLLOW THIS STRUCTURE:

<reply>
Write a warm, human, concise message.
Give one or two helpful suggestions.
Ask one or two qualifying questions (budget, dates, capacity, location).
</reply>

<metadata>
{
  "score": number between 1 and 10,
  "lead_type": "Hot" or "Warm" or "Cold",
  "business_category": string or null,
  "location": string or null,
  "client_budget": string or null,
  "follow_up_next_step": string or null,
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "source": "web_chat",
  "chat_type": "${chatType}"
}
</metadata>

Rules:
- The metadata MUST be valid JSON.
- If unsure, set fields to null.
    `.trim();

    // ==============================
    // OPENAI COMPLETION
    // ==============================
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // ==============================
    // PARSE AI RESPONSE
    // ==============================
    let reply = "";
    let metadata: any = {};

    const replyMatch = fullContent.match(/<reply>([\s\S]*?)<\/reply>/i);
    if (replyMatch) reply = replyMatch[1].trim();

    const metaMatch = fullContent.match(/<metadata>([\s\S]*?)<\/metadata>/i);
    if (metaMatch) {
      try {
        metadata = JSON.parse(metaMatch[1].trim());
      } catch (err) {
        console.error("❌ Metadata JSON parse error", err);
        metadata = {};
      }
    }

    // ==============================
    // SAVE CHAT TO SUPABASE
    // ==============================
    try {
      const supabase = getSupabaseServerClient();

      if (!supabase) {
        console.error("❌ Supabase client unavailable");
      } else {
        const { error } = await supabase.from("vendor_leads").insert({
          organisation_id: organisationId,
          agent_id: agentId,
          chat_type: chatType,
          source: metadata?.source || "web_chat",

          raw_chat_messages: messages,
          raw_metadata: metadata,

          // Core lead attributes
          score: metadata.score ?? null,
          lead_type: metadata.lead_type ?? null,
          business_category: metadata.business_category ?? null,
          location: metadata.location ?? null,
          budget: metadata.client_budget ?? null,
          follow_up_next_step: metadata.follow_up_next_step ?? null,

          name: metadata.name ?? null,
          email: metadata.email ?? null,
          phone: metadata.phone ?? null,

          // B2C — COUPLES
          couple_destination:
            chatType === "couple" ? metadata.location ?? null : null,
          couple_guest_count:
            chatType === "couple" ? metadata.guest_count ?? null : null,

          // B2B — VENDORS / VENUES
          vendor_property_type:
            chatType === "vendor" ? metadata.business_category ?? null : null,
          vendor_capacity:
            chatType === "vendor" ? metadata.capacity ?? null : null,
        });

        if (error) {
          console.error("❌ Supabase insert error", error);
        }
      }
    } catch (err) {
      console.error("❌ Supabase block crashed", err);
    }

    // ==============================
    // RETURN CLEAN RESPONSE
    // ==============================
    return NextResponse.json(
      {
        ok: true,
        reply,
        metadata,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ vendors-chat API fatal error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
