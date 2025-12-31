import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;

    return NextResponse.json({ ok: true, text });
  } catch (err) {
    console.error("AI email error:", err);
    return NextResponse.json(
      { ok: false, error: "AI generation failed" },
      { status: 500 }
    );
  }
}
