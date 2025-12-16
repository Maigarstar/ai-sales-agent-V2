import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// FORCE DYNAMIC: Ensures fresh keys are loaded on every request
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
  couple_destination?: string | null;
  couple_guest_count?: string | null;
  source?: string | null;
  [key: string]: any;
};

// FIX 1: Use a safe fallback so build doesn't crash
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// FIX 2: Safe fallbacks for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

function getSupabaseServerClient() {
  // If in build mode (placeholder), return null
  if (supabaseUrl === "https://placeholder.supabase.co" || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    // RUNTIME CHECK: Stop here if the live site still has the dummy key
    // This gives you a clear error in the browser network tab if keys are wrong
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("sk-dummy")) {
       console.error("CRITICAL ERROR: OpenAI Key is still the dummy key!");
       return NextResponse.json(
        { ok: false, error: "Server Configuration Error: Using Dummy Key" },
        { status: 500 }
      );
    }

    const chatType: "vendor" | "couple" =
      body.chatType === "vendor" || body.mode === "vendor" ? "vendor" : "couple";

    const organisationId: string =
      body.organisationId || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
    const agentId: string =
      body.agentId || "70660422-489c-4b7d-81ae-b786e43050db";

    let conversationId: string | null =
      typeof body.conversation_id === "string" ? body.conversation_id : null;

    if (messages.length === 0) {
      return NextResponse.json({ ok: false, error: "No messages supplied" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json({ ok: false, error: "No user message found" }, { status: 400 });
    }

    // --- SYSTEM PROMPTS ---
    const systemPrompt = chatType === "vendor"
      ? `
You are the AI Vendor Qualification Assistant for 5 Star Weddings.
First, write a warm, natural reply for the business. Then, output metadata in valid JSON inside a <metadata> block.
Format:
[Reply text here]
<metadata>
{ "score": 0, "lead_type": "Warm", "business_category": "Venue", "location": "Italy", "name": null, "email": null, "phone": null }
</metadata>
`.trim()
      : `
You are the AI Wedding Concierge for couples.
First, write a warm reply. Then, output metadata in valid JSON inside a <metadata> block.
Format:
[Reply text here]
<metadata>
{ "score": 0, "lead_type": "Warm", "business_category": "Couple", "location": "Italy", "name": null, "email": null, "phone": null }
</metadata>
`.trim();

    // --- CALL OPENAI ---
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // --- PARSE METADATA ---
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
      }
    }
    if (!replyText) replyText = fullContent.trim();

    // --- SUPABASE SAVING ---
    const supabase = getSupabaseServerClient();
    let leadId: string | null = null;

    if (supabase) {
      // 1. Handle Conversation
      if (!conversationId) {
        const { data: conv } = await supabase.from("conversations").insert({
            organisation_id: organisationId,
            agent_id: agentId,
            chat_type: chatType,
            status: "new",
            channel: "web",
            last_user_message_at: new Date().toISOString(),
            user_type: chatType === "vendor" ? "vendor" : "planning",
            first_message: lastUserMessage.content,
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
          }).select("id").single();
        if (conv) conversationId = conv.id;
      } else {
        await supabase.from("conversations").update({
            last_user_message_at: new Date().toISOString(),
            last_message: replyText,
            contact_name: metadata.name ?? null,
            contact_email: metadata.email ?? null,
            contact_phone: metadata.phone ?? null,
        }).eq("id", conversationId);
      }

      // 2. Save Messages
      if (conversationId) {
        await supabase.from("messages").insert([
          { conversation_id: conversationId, sender_type: "user", content: lastUserMessage.content },
          { conversation_id: conversationId, sender_type: "assistant", content: replyText }
        ]);
        // Transcript for live view
        await supabase.from("conversation_messages").insert([
           { conversation_id: conversationId, sender_type: chatType === "vendor" ? "vendor" : "couple", message: lastUserMessage.content },
           { conversation_id: conversationId, sender_type: "assistant", message: replyText }
        ]);
      }

      // 3. Create/Update Vendor Lead
      const { data: leadData } = await supabase.from("vendor_leads").insert({
          organisation_id: organisationId,
          agent_id: agentId,
          chat_type: chatType,
          source: metadata.source || "web_chat",
          raw_chat_messages: messages,
          raw_metadata: metadata,
          score: metadata.score ?? null,
          lead_type: metadata.lead_type ?? null,
          business_category: metadata.business_category ?? null,
          location: metadata.location ?? null,
          name: metadata.name ?? null,
          email: metadata.email ?? null,
          phone: metadata.phone ?? null,
      }).select().single();

      if (leadData) {
        leadId = leadData.id;
        if (conversationId) await supabase.from("conversations").update({ lead_id: leadId }).eq("id", conversationId);
        
        // 4. Vendor Messages Stream
        await supabase.from("vendor_messages").insert([
            { lead_id: leadId, role: "user", message: lastUserMessage.content },
            { lead_id: leadId, role: "assistant", message: replyText }
        ]);
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
    return NextResponse.json({ ok: false, error: err.message || "Server Error" }, { status: 500 });
  }
}