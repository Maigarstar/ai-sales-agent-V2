import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
You are the AI Vendor Qualification Assistant for 5 Star Weddings.

Your response MUST be formatted EXACTLY like this:

<reply>
Here is the natural human response you want the vendor to read.
</reply>

<metadata>
{
  "score": number 1 to 10,
  "lead_type": "Hot" or "Warm" or "Cold",
  "business_category": string or null,
  "location": string or null,
  "client_budget": string or null,
  "style": string or null,
  "marketing_channels": string or null
}
</metadata>

RULES
- reply MUST be inside <reply> ... </reply>
- metadata MUST be inside <metadata> ... </metadata>
- metadata must ALWAYS be valid JSON
- NEVER wrap both together in one JSON object
- NEVER write explanation outside these tags
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    const output = completion.choices[0].message.content || "";

    return NextResponse.json({ ok: true, message: output });
  } catch (error) {
    console.error("Vendor chat error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
