import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "nodejs"; // switch to node for DB write support

export async function POST(req: Request) {
  try {
    const { text, lead_id } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Not enough content to analyze." },
        { status: 400 }
      );
    }

    const prompt = `
You are Aura, the AI concierge for 5 Star Weddings. Analyze this conversation between a couple and the concierge. 
Output structured JSON with:
- tone: emotional temperature (e.g. excited, calm, unsure)
- intent: couple’s goal or stage in journey
- summary: 2–3 sentence overview
- recommendation: next best action

Conversation:
"""${text}"""

Respond ONLY in JSON format:
{
  "tone": "",
  "intent": "",
  "summary": "",
  "recommendation": ""
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: "You are Aura, a luxury wedding AI assistant." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message?.content || "";
    const jsonStart = reply.indexOf("{");
    const jsonEnd = reply.lastIndexOf("}") + 1;

    const parsed =
      jsonStart !== -1 && jsonEnd !== -1
        ? JSON.parse(reply.slice(jsonStart, jsonEnd))
        : {
            tone: "Neutral",
            intent: "Unknown",
            summary: reply || "No summary generated.",
            recommendation: "Manual review recommended.",
          };

    // ✅ Save to Supabase
    const supabase = createClient();
    if (lead_id) {
      await supabase
        .from("vendor_leads")
        .update({
          ai_tone: parsed.tone,
          ai_intent: parsed.intent,
          ai_summary: parsed.summary,
          ai_recommendation: parsed.recommendation,
        })
        .eq("id", lead_id);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI insights error:", err);
    return NextResponse.json(
      {
        tone: "Unavailable",
        intent: "Unavailable",
        summary: "AI could not process this conversation.",
        recommendation: "Try again later or check logs.",
      },
      { status: 200 }
    );
  }
}
