import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      userType = "client", // Distinguishes between Persona A and B
      knowledgeContext, 
      calendarRequested,
      organisationId = "9ecd45ab-6ed2-46fa-914b-82be313e06e4",
      agentId = "70660422-489c-4b7d-81ae-b786e43050db"
    } = body;

    let conversationId = body.conversation_id || null;

    // 1. DYNAMIC SYSTEM PROMPT
    const personaLogic = userType === 'business' 
      ? `You are speaking to a BUSINESS PARTNER. Focus on lead quality, ROI, and optimizing their luxury profile. Act as a sales consultant.`
      : `You are speaking to a CLIENT. Focus on their vision and dream collection. Act as an elite personal concierge.`;

    const systemPrompt = `
Identity: You are Aura, the bespoke luxury concierge for the 5 Star collection.
Tone: Elegant, minimalist, proactive. Use: "Shall we unveil the possibilities?"
Persona Context: ${personaLogic}

INSTRUCTIONS:
1. Provide a warm, high-end reply. 
2. Acknowledge dates, budgets, or destinations with "Added to your collection."
3. ALWAYS output metadata in valid JSON inside a <metadata> block after your text.

Format:
[Reply text]
<metadata>
{ "score": 10, "lead_type": "Hot", "name": null, "email": null, "budget": null }
</metadata>`.trim();

    // 2. OPENAI CALL
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message }
      ] as any,
    });

    const fullContent = completion.choices[0]?.message?.content || "";

    // 3. SEPARATE REPLY FROM METADATA
    let replyText = fullContent;
    let metadata: any = {};
    const metaStart = fullContent.indexOf("<metadata>");
    const metaEnd = fullContent.indexOf("</metadata>");

    if (metaStart !== -1 && metaEnd !== -1) {
      replyText = fullContent.slice(0, metaStart).trim();
      try {
        metadata = JSON.parse(fullContent.slice(metaStart + 10, metaEnd).trim());
      } catch (e) { console.error("Metadata parse error"); }
    }

    // 4. SUPABASE SYNC (Lead & Message Logging)
    if (supabase) {
      // Manage Conversation
      if (!conversationId) {
        const { data: conv } = await supabase.from("conversations").insert({
          organisation_id: organisationId,
          agent_id: agentId,
          status: "new",
          last_message: replyText,
          contact_name: metadata.name
        }).select("id").single();
        if (conv) conversationId = conv.id;
      }

      // Log Lead Data
      await supabase.from("vendor_leads").insert({
        organisation_id: organisationId,
        agent_id: agentId,
        source: "aura_concierge",
        score: metadata.score || 5,
        lead_type: metadata.lead_type || "Warm",
        raw_metadata: metadata
      });

      // Log Transcript
      if (conversationId) {
        await supabase.from("messages").insert([
          { conversation_id: conversationId, sender_type: "user", content: message },
          { conversation_id: conversationId, sender_type: "assistant", content: replyText }
        ]);
      }
    }

    return NextResponse.json({ ok: true, reply: replyText, metadata, conversation_id: conversationId });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}