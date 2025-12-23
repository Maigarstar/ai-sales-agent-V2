import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type LeadMetadata = {
  score?: number;
  lead_type?: "Hot" | "Warm" | "Cold";
  business_category?: string | null;
  location?: string | null;
  client_budget?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  [key: string]: any;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      message, 
      messages: history = [], 
      knowledgeContext, 
      calendarRequested,
      organisationId = "9ecd45ab-6ed2-46fa-914b-82be313e06e4",
      agentId = "70660422-489c-4b7d-81ae-b786e43050db"
    } = body;

    let conversationId = body.conversation_id || null;

    // 1. CALENDAR & KNOWLEDGE INJECTION
    let calendarContext = "If asked about meetings, inform the user you can check the calendar.";
    if (calendarRequested) {
      calendarContext = "Your next available slots for a consultation are Tuesday at 2pm and Wednesday at 10am.";
    }

    // 2. CONSTRUCT SYSTEM PROMPT WITH METADATA EXTRACTION
    const systemPrompt = `
You are Aura, the bespoke luxury concierge for 5 Star Weddings. 
Brand Knowledge: ${JSON.stringify(knowledgeContext)}
Availability: ${calendarContext}

INSTRUCTIONS:
1. Provide a warm, high-end reply.
2. After your reply, output metadata in valid JSON inside a <metadata> block.
3. Metadata should extract Lead info (name, email, intent, score).

Format:
[Reply text here]
<metadata>
{ "score": 10, "lead_type": "Hot", "business_category": "Venue", "name": null, "email": null }
</metadata>`.trim();

    // 3. PREPARE MESSAGES FOR OPENAI
    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      messages: apiMessages,
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // 4. PARSE REPLY VS METADATA
    let replyText = fullContent;
    let metadata: LeadMetadata = {};
    const metaStart = fullContent.indexOf("<metadata>");
    const metaEnd = fullContent.indexOf("</metadata>");

    if (metaStart !== -1 && metaEnd !== -1) {
      replyText = fullContent.slice(0, metaStart).trim();
      const jsonBlock = fullContent.slice(metaStart + 10, metaEnd).trim();
      try {
        metadata = JSON.parse(jsonBlock);
      } catch (e) { console.error("Metadata parse error"); }
    }

    // 5. SUPABASE TRACKING & LEAD SYNC
    if (supabase) {
      // Handle Conversation Tracking
      if (!conversationId) {
        const { data: conv } = await supabase.from("conversations").insert({
          organisation_id: organisationId,
          agent_id: agentId,
          status: "new",
          last_message: replyText,
          contact_name: metadata.name,
          contact_email: metadata.email
        }).select("id").single();
        if (conv) conversationId = conv.id;
      } else {
        await supabase.from("conversations").update({
          last_message: replyText,
          contact_name: metadata.name,
          contact_email: metadata.email
        }).eq("id", conversationId);
      }

      // Save Lead Data
      const { data: leadData } = await supabase.from("vendor_leads").insert({
        organisation_id: organisationId,
        agent_id: agentId,
        source: metadata.source || "aura_live_chat",
        score: metadata.score,
        lead_type: metadata.lead_type,
        raw_metadata: metadata,
        name: metadata.name,
        email: metadata.email
      }).select("id").single();

      // Log Messages to Transcript
      if (conversationId) {
        await supabase.from("messages").insert([
          { conversation_id: conversationId, sender_type: "user", content: message },
          { conversation_id: conversationId, sender_type: "assistant", content: replyText }
        ]);
      }
    }

    return NextResponse.json({
      ok: true,
      reply: replyText,
      metadata,
      conversation_id: conversationId
    });

  } catch (error: any) {
    console.error("Aura API Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}