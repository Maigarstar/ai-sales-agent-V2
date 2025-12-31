import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const lead = await req.json();

    if (!lead || typeof lead !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid lead payload" },
        { status: 400 }
      );
    }

    // ---------------------------
    // THE NEW SUPER PROMPT (v3)
    // ---------------------------
    const prompt = `
You are Taigenic AI, an elite Lead Intelligence Engine.

Analyse ALL fields in the lead, including:
- metadata
- budget
- location
- business category
- chat history
- guest count
- tone
- urgency
- objections
- timeline  
- readiness to buy

You MUST return ONLY valid JSON with this schema:

{
  "summary": "short paragraph",
  "risks": "short paragraph",
  "next_steps": "short paragraph",
  "suggested_status": {
     "status": "hot or warm or cold or qualified or booked or new or not_fit",
     "confidence": 0.0 to 1.0
  },
  "tags": ["string", "string", ...] 
}

TAG RULES:
- extract countries, venues, locations
- extract budgets or ranges
- detect interest signals (eg: 'urgent', 'high intent', 'needs more info')
- detect event type, vendor type, timeline
- return 5 to 20 tags max
- tags MUST be lowercase and descriptive

STATUS LOGIC:
- "hot" if high intent, clear need, urgent, ready to book
- "warm" if positive but needs follow-up
- "cold" if slow, unsure, weak signals
- "qualified" if strong match based on metadata
- "booked" only if explicitly confirmed
- "not_fit" if they are irrelevant to the business
- "new" if no signals exist

LEAD DATA:
${JSON.stringify(lead, null, 2)}
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      messages: [
        { role: "system", content: "You output ONLY pure JSON. Never add commentary." },
        { role: "user", content: prompt }
      ]
    });

    let raw = completion.choices?.[0]?.message?.content || "";

    // Remove accidental code fencing
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    // Attempt parse
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("AI JSON PARSE ERROR:", raw);
      return NextResponse.json(
        { ok: false, error: "AI returned invalid JSON", raw },
        { status: 500 }
      );
    }

    // Clean structure
    const output = {
      summary: parsed.summary || "",
      risks: parsed.risks || "",
      next_steps: parsed.next_steps || "",
      suggested_status: parsed.suggested_status || {
        status: "new",
        confidence: 0.0
      },
      tags: Array.isArray(parsed.tags) ? parsed.tags : []
    };

    return NextResponse.json({
      ok: true,
      insight: output
    });

  } catch (err: any) {
    console.error("AI Insight Engine Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
