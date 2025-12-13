import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client. Assumes OPENAI_API_KEY is in your environment.
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // The system prompt remains correct for enforcing the metadata structure.
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
  "timeline": string or null,
  "red_flags": string or null
}
</metadata>
`;

    const completion = await client.chat.completions.create({
      // ✅ FIX: Changed invalid model "gpt-4.1" to a valid model, "gpt-4o"
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Could not process the request." },
      { status: 500 }
    );
  }
}