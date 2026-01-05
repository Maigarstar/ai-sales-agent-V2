import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

function safeFallback(lastUser: string) {
  const base = String(lastUser || "").trim();
  const short = base.length > 60 ? base.slice(0, 60) + "…" : base;

  const list = [
    "Show me 3 options and explain why each fits",
    "What would you ask me next to narrow this down",
    "Give me a simple checklist for the next 7 days",
    "What budget range should I expect for this plan",
  ];

  if (short) list[0] = "Give me 3 options for: " + short;
  return list.slice(0, 4);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const lastUser = String(body?.lastUser || "").trim();
    const lastAssistant = String(body?.lastAssistant || "").trim();

    if (!lastUser || !lastAssistant) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON, an array of 3 to 4 short follow up questions. No numbering, no bullets, no extra text.",
        },
        {
          role: "user",
          content: [
            "Last user message:",
            lastUser,
            "",
            "Assistant reply:",
            lastAssistant,
            "",
            "Return a JSON array like:",
            '["Question 1","Question 2","Question 3"]',
          ].join("\n"),
        },
      ],
    });

    const raw = String(completion.choices?.[0]?.message?.content || "").trim();

    let arr = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      arr = [];
    }

    const followups = (arr || [])
      .filter((x) => typeof x === "string")
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 4);

    if (followups.length === 0) {
      return NextResponse.json({ ok: true, followups: safeFallback(lastUser) }, { status: 200 });
    }

    return NextResponse.json({ ok: true, followups }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: true, followups: safeFallback("") },
      { status: 200 }
    );
  }
}
