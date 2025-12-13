import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
You are the 5 Star Weddings Vendor Sales Agent.
Respond with plain text only.
At the END of your message, return:

<metadata>{
 "score": number 1 to 10,
 "lead_type": "Hot" | "Warm" | "Cold",
 "business_category": string,
 "location": string,
 "client_budget": string,
 "style": string,
 "marketing_channels": string
}</metadata>

Do not wrap the main text in JSON.
Do not respond with structured data anywhere except inside <metadata>.
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: false
    });

    return NextResponse.json({
      reply: completion.choices?.[0]?.message?.content ?? ""
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { reply: "Apologies, something went wrong." },
      { status: 500 }
    );
  }
}
