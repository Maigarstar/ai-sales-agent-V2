import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { meta, transcript } = await req.json();

    if (!meta || !meta.leadType) {
      return new Response("Missing metadata", { status: 400 });
    }

    const systemPrompt = `
You are Yasmine from 5 Star Weddings, writing follow-up emails to wedding vendors.
Your tone is refined, warm, elegant and confident. 
Every email must sound like a luxury brand, not automated.

Rules:
• Never mention AI.
• Never reveal internal scoring.
• Keep sentences smooth, polished and human.
• Use subtle luxury language (Vogue, Tatler style).
• If the lead is HOT, be more proactive and personal.
• If WARM, be encouraging and informative.
• If COLD, be gentle and offer value without pressure.
• Keep the email 3–5 short paragraphs.

End with:
Warm regards,  
Yasmine  
5 Star Weddings  
5starweddingdirectory.com  
`;

    const vendorSummary = `
Lead Type: ${meta.leadType}
Category: ${meta.businessCategory || "Unknown"}
Location: ${meta.location || "Unknown"}
Client Budget: ${meta.clientBudget || "Unknown"}
Style: ${meta.style || "Unknown"}
Marketing Channels: ${meta.marketingChannels || "Unknown"}

Transcript: ${JSON.stringify(transcript)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create the follow-up email for this vendor:\n${vendorSummary}`,
        },
      ],
    });

    const email = completion.choices[0].message.content || "";

    return new Response(
      JSON.stringify({ email }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Follow-up API Error:", err);
    return new Response("Server error", { status: 500 });
  }
}
