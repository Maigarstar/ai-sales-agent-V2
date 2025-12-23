import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      message,
      messages: history = [],
      knowledgeContext = [],
      calendarRequested,
      organisationId = "9ecd45ab-6ed2-46fa-914b-82be313e06e4",
    } = body;

    // -----------------------------------------------------
    // 1. Knowledge Base Context
    // -----------------------------------------------------
    let contextText = "";
    if (knowledgeContext.length > 0) {
      for (const file of knowledgeContext) {
        const { data, error } = await supabase.storage
          .from("knowledge-base")
          .download(file.path);

        if (!error && data) {
          const text = await data.text();
          contextText += `\n[Source: ${file.name}]\n${text}`;
        }
      }
    }

    // -----------------------------------------------------
    // 2. Aura System Prompt
    // -----------------------------------------------------
    const systemPrompt = `
You are AURA, the official AI Concierge for 5 Star Weddings (5starweddingdirectory.com).

Tone: Vogue, Tatler, Condé Nast. Refined. Editorial. Calm authority.
Never sound like a chatbot. Never use emojis.

Roles:
- Couples: Luxury Matchmaker
- Vendors: Growth & Visibility Advisor

Context:
${contextText || "No additional files provided."}

Availability:
${calendarRequested
  ? "Consultations available Tuesday at 2pm and Wednesday at 10am."
  : "Consultations available on request."}

RULES:
- No system notes
- No reasoning
- Always end with <metadata> JSON block

<metadata>
{
  "score": 0.9,
  "lead_type": "Hot",
  "user_segment": "Vendor",
  "interest": "Listing",
  "email": null
}
</metadata>
`.trim();

    // -----------------------------------------------------
    // 3. OpenAI Request (RENAMED VARIABLE)
    // -----------------------------------------------------
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m: any) => ({
          role: m.role === "aura" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
    });

    const auraReply =
      completion.choices[0]?.message?.content ?? "";

    // -----------------------------------------------------
    // 4. Extract Metadata
    // -----------------------------------------------------
    let raw_metadata: any = null;
    const metadataMatch = auraReply.match(
      /<metadata>([\s\S]*?)<\/metadata>/
    );

    if (metadataMatch) {
      try {
        raw_metadata = JSON.parse(metadataMatch[1]);
      } catch {
        console.warn("Metadata parsing failed");
      }
    }

    // -----------------------------------------------------
    // 5. Intent Detection Fallback
    // -----------------------------------------------------
    const intentKeywords = [
      "book",
      "join",
      "price",
      "seo",
      "branding",
      "web",
      "feature",
      "listing",
    ];

    const isHotLead = intentKeywords.some((k) =>
      auraReply.toLowerCase().includes(k)
    );

    // -----------------------------------------------------
    // 6. Insert Lead
    // -----------------------------------------------------
    if (isHotLead || raw_metadata) {
      await supabase.from("vendor_leads").insert({
        organisation_id: organisationId,
        source: "Aura Chat",
        intent_summary: `Inquiry: ${message}`,
        status: "new",
        lead_type: raw_metadata?.lead_type || (isHotLead ? "Hot" : "Warm"),
        user_segment: raw_metadata?.user_segment || "Vendor",
        raw_metadata,
        created_at: new Date().toISOString(),
      });
    }

    // -----------------------------------------------------
    // 7. Return Clean Reply
    // -----------------------------------------------------
    return NextResponse.json({
      ok: true,
      reply: auraReply
        .replace(/<metadata>[\s\S]*?<\/metadata>/gi, "")
        .trim(),
      metadata: raw_metadata || {
        lead_type: isHotLead ? "Hot" : "Warm",
      },
    });
  } catch (error) {
    console.error("Aura Chat API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
