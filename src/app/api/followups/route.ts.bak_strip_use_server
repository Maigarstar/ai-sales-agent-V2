import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function safeParseArray(raw: string): string[] {
  const t = String(raw || "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  const slice = t.slice(start, end + 1);

  try {
    const parsed = JSON.parse(slice);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => String(x || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const reply = String(body?.reply || "").trim();
    const userMessage = String(body?.userMessage || "").trim();
    const flow = String(body?.flow || "aura").trim();

    if (!reply) {
      return NextResponse.json({ ok: false, followUps: [] }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "Return exactly 3 suggested follow up questions as a pure JSON array of strings. No numbering, no extra keys, no commentary. Keep each under 64 characters. Tone, refined luxury wedding concierge. Use British English. Avoid emojis.",
        },
        {
          role: "user",
          content: [
            "Flow: " + flow,
            "User message: " + userMessage,
            "Assistant reply: " + reply,
            "",
            'Return: ["...","...","..."]',
          ].join("\n"),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const list = safeParseArray(raw);

    return NextResponse.json({ ok: true, followUps: list });
  } catch {
    return NextResponse.json({ ok: true, followUps: [] });
  }
}
