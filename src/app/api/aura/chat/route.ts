import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/* ---------------------------------
   CLIENTS
---------------------------------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ---------------------------------
   AURA CHAT ROUTE
---------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      message: singleMessage,
      messages: history = [],
      knowledgeContext = [],
      calendarRequested = false,
      organisationId = "9ecd45ab-6ed2-46fa-914b-82be313e06e4",
    } = body;

    /* ---------------------------------
       Resolve last user message
    ---------------------------------- */
    const lastMessage =
      singleMessage ||
      history
        .filter((m: any) => m.role === "user")
        .slice(-1)[0]?.content ||
      "Hello Aura";

    /* ---------------------------------
       Load knowledge context
    ---------------------------------- */
    let contextText = "";

    for (const file of knowledgeContext) {
      const { data } = await supabase.storage
        .from("knowledge-base")
        .download(file.path);

      if (data) {
        const text = await data.text();
        contextText += `\n[Source: ${file.name}]\n${text}`;
      }
    }

    /* ---------------------------------
       System Prompt (Aura)
    ---------------------------------- */
    const systemPrompt = `
You are AURA, the official concierge for 5 Star Weddings (5starweddingdirectory.com).

Voice:
Vogue, Tatler, Condé Nast Traveller. Calm authority, refined, editorial.
Never mention AI. Never use emojis.

Roles:
- Couples: Luxury matchmaker and wedding vision curator
- Vendors (only if asked): Visibility and positioning advisor

Context:
${contextText || "No additional reference material provided."}

Availability:
${
  calendarRequested
    ? "Private consultations available Tuesday at 2pm and Wednesday at 10am."
    : "Private consultations available on request."
}

Rules:
- Write naturally, never like a chatbot
- Ask thoughtful questions before making recommendations
- End responses with a <metadata> block for internal intelligence only

<metadata>
{
  "lead_type": "Warm",
  "user_segment": "Couple",
  "interest": "Inspiration",
  "email": null
}
</metadata>
`.trim();

    /* ---------------------------------
       OpenAI Request
    ---------------------------------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: lastMessage },
      ],
    });

    const rawReply = completion.choices[0]?.message?.content || "";

    /* ---------------------------------
       Extract Metadata (Internal Only)
    ---------------------------------- */
    let rawMetadata: any = null;

    const metadataMatch = rawReply.match(
      /<metadata>([\s\S]*?)<\/metadata>/i
    );

    if (metadataMatch) {
      try {
        rawMetadata = JSON.parse(metadataMatch[1]);
      } catch {
        console.warn("Aura metadata parse failed");
      }
    }

    /* ---------------------------------
       Fallback intent detection
    ---------------------------------- */
    const hotKeywords = [
      "book",
      "pricing",
      "availability",
      "join",
      "feature",
      "listing",
      "marketing",
      "partnership",
    ];

    const isHotLead = hotKeywords.some(word =>
      rawReply.toLowerCase().includes(word)
    );

    /* ---------------------------------
       Persist lead (non-blocking)
    ---------------------------------- */
    if (rawMetadata || isHotLead) {
      try {
        await supabase.from("vendor_leads").insert({
          organisation_id: organisationId,
          source: "Aura Chat",
          intent_summary: `Inquiry: ${lastMessage}`,
          status: "new",
          lead_type: rawMetadata?.lead_type || (isHotLead ? "Hot" : "Warm"),
          user_segment: rawMetadata?.user_segment || "Couple",
          raw_metadata: rawMetadata,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Aura lead insert failed", dbError);
      }
    }

    /* ---------------------------------
       Clean reply for user
    ---------------------------------- */
    const cleanReply = rawReply
      .replace(/<metadata>[\s\S]*?<\/metadata>/gi, "")
      .trim();

    return NextResponse.json({
      ok: true,
      reply: cleanReply,
      metadata: rawMetadata || {
        lead_type: isHotLead ? "Hot" : "Warm",
      },
      persona: "b2c",
    });
  } catch (error: any) {
    console.error("Aura Chat API Error:", error.message);
    return NextResponse.json(
      { ok: false, error: "Unable to continue the conversation." },
      { status: 500 }
    );
  }
}
