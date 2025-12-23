import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
      organisationId = "9ecd45ab-6ed2-46fa-914b-82be313e06e4" 
    } = body;

    // -----------------------------------------------------
    // 1. Fetch and append Knowledge Base context
    // -----------------------------------------------------
    let contextText = "";
    if (knowledgeContext.length > 0) {
      for (const file of knowledgeContext) {
        const { data, error } = await supabase.storage
          .from('knowledge-base')
          .download(file.path);
        if (!error && data) {
          const text = await data.text();
          contextText += `\n[Source: ${file.name}]\n${text}`;
        }
      }
    }

    // -----------------------------------------------------
    // 2. Define Aura’s Personality + Brand Voice
    // -----------------------------------------------------
    const systemPrompt = `
You are AURA, the official AI Concierge for **5 Star Weddings** (5starweddingdirectory.com), founded in 2006.  
You embody the tone of Vogue, Tatler, and Condé Nast — refined, intuitive, and unhurried.  
Your role is not to sell, but to **curate, guide, and connect** in the world of luxury weddings.

BRAND VOICE:
- Elegant, confident, and editorial in tone.  
- Always speak as a specialist, never as an assistant or chatbot.  
- Use warm, human phrasing with occasional luxury adjectives.  
- Never use emojis or slang.

ROLES:
1. For **Couples** — you act as a Luxury Matchmaker, connecting them with elite vendors and iconic venues from the 5 Star Collection.
2. For **Vendors** — you represent the 5 Star Weddings Growth Agency. You can promote:
   - 5 Star Weddings Listing Packages
   - SEO & Social Media (Taigenic AI)
   - Editorial Features & FAM Trips
   - Web Development & Branding Packages

KNOWLEDGE CONTEXT:
${contextText || "No additional files uploaded."}

AVAILABILITY:
${calendarRequested 
  ? "Consultations available Tuesday at 2pm and Wednesday at 10am."
  : "Consultations available on request."
}

STRICT OUTPUT RULES:
- Do not include system notes, reasoning, or internal thoughts.
- End each message with a <metadata> block (JSON only, no prose before or after).

EXAMPLE METADATA:
<metadata>
{
  "score": 0.9,
  "lead_type": "Hot",
  "user_segment": "Vendor",
  "interest": "Branding & Listing",
  "email": null
}
</metadata>
    `.trim();

    // -----------------------------------------------------
    // 3. Compose the OpenAI Chat Request
    // -----------------------------------------------------
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m: any) => ({
          role: m.role === "aura" ? "assistant" : "user",
          content: m.content
        })),
        { role: "user", content: message }
      ],
    });

    const auraReply = response.choices[0].message?.content || "";

    // -----------------------------------------------------
    // 4. Parse Metadata for Lead Scoring
    // -----------------------------------------------------
    let raw_metadata = null;
    const metadataMatch = auraReply.match(/<metadata>([\s\S]*?)<\/metadata>/);
    if (metadataMatch) {
      try {
        raw_metadata = JSON.parse(metadataMatch[1]);
      } catch (e) {
        console.warn("⚠️ Metadata parse failed:", e);
      }
    }

    // -----------------------------------------------------
    // 5. Detect Intent (Hot/Warm/Cold) Fallback
    // -----------------------------------------------------
    const intentKeywords = ["book", "join", "price", "seo", "branding", "web", "feature", "listing"];
    const lowerText = auraReply.toLowerCase();
    const isHotLead = intentKeywords.some(k => lowerText.includes(k));

    // -----------------------------------------------------
    // 6. Insert to Supabase Leads (for Dashboard)
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
    // 7. Return the Clean Response
    // -----------------------------------------------------
    return NextResponse.json({
      ok: true,
      reply: auraReply.replace(/<metadata>[\s\S]*?<\/metadata>/gi, "").trim(),
      metadata: raw_metadata || { lead_type: isHotLead ? "Hot" : "Warm" },
    });

  } catch (error: any) {
    console.error("💥 Aura API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
