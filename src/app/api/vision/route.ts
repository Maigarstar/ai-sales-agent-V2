// src/app/api/vision/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const chatType = body?.chatType === "business" ? "business" : "couple";
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const userTurns = Number(body?.userTurns || 0);

    const system = `
You are the concierge inside 5 Star Weddings (also known as 5 Star Wedding Directory), powered by Taigenic.ai.

Rules:
- Keep replies succinct. One paragraph only. Max two short lines.
- No markdown, no bullets, no numbering, no asterisks.
- Ask one clear question at the end.
- Do not mention or recommend any external websites or competitors.
- Keep everything inside our ecosystem: 5 Star Weddings, our wedding collection, our recommended vendors, our venues.
- For couples (Aura): immersive, elegant, helpful, propose next step with venues and recommended vendors from 5 Star Weddings.
- For vendors (Atlas): focus on how we connect them to destination couples via 5 Star Weddings, clarify their offering, and suggest next step to work with us.
- If userTurns <= 3, keep the reply extra short and purely clarifying.
`.trim();

    const persona =
      chatType === "business"
        ? "You are Atlas. Elegant, calm, commercial, and precise."
        : "You are Aura. Elegant, calm, and experience-led.";

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: userTurns <= 3 ? 110 : 220,
      messages: [
        { role: "system", content: system },
        { role: "system", content: persona },
        ...messages.map((m: any) => ({
          role: m?.role === "user" ? "user" : "assistant",
          content: String(m?.content || ""),
        })),
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Tell me a little more.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Connection interrupted." }, { status: 200 });
  }
}
