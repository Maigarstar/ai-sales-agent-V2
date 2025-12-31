import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const lead = await req.json();

    if (!lead?.id) {
      return NextResponse.json({ ok: false, error: "Missing lead ID" }, { status: 400 });
    }

    // Build AI scoring prompt
    const prompt = `
You are the AI Scoring Engine for Taigenic.

Score this lead from 1 to 10 based on intent, clarity, budget, tone, urgency, and fit for the wedding industry.

Return ONLY a JSON object like:
{
  "score": number,
  "reason": "brief explanation"
}

Lead:
${JSON.stringify(lead, null, 2)}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Return ONLY JSON. No text outside JSON." },
        { role: "user", content: prompt }
      ]
    });

    let raw = completion.choices?.[0]?.message?.content || "";
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("AI SCORE JSON ERROR", raw);
      return NextResponse.json(
        { ok: false, error: "Invalid JSON from AI", raw },
        { status: 500 }
      );
    }

    const score = Math.min(Math.max(parsed.score || 0, 1), 10);

    // Update the score in DB – auto-detect table
    const table = lead.table || "vendor_leads"; // fallback
    const { data, error } = await supabase
      .from(table)
      .update({ score })
      .eq("id", lead.id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("DB Update error for AI score", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      score,
      reason: parsed.reason || "AI reasoning unavailable",
      lead: data
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected scoring error" },
      { status: 500 }
    );
  }
}
