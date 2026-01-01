import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
- tone: emotional temperature
- intent: couple’s goal
- summary: 2–3 sentence overview
- recommendation: next best action

Conversation: """${text}"""

Respond ONLY in JSON format.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: "You are Aura, a luxury wedding AI assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = completion.choices[0].message?.content ?? "";

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

    // ✅ IMPORTANT: await the Supabase client
    const supabase = await createServerSupabase();

    if (lead_id) {
      const { error } = await supabase
        .from("vendor_leads")
        .update({
          ai_tone: parsed.tone,
          ai_intent: parsed.intent,
          ai_summary: parsed.summary,
          ai_recommendation: parsed.recommendation,
        })
        .eq("id", lead_id);

      if (error) {
        console.error("Database update error:", error);
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI insights error:", err);
    return NextResponse.json(
      {
        tone: "Unavailable",
        intent: "Unavailable",
        summary: "AI could not process this conversation.",
        recommendation: "Try again later.",
      },
      { status: 200 }
    );
  }
}
