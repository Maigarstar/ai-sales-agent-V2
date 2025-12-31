import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ATLAS_SYSTEM_PROMPT = `
You are Atlas, the vendor qualification assistant for 5 Star Weddings.

Rules:
- Never mention AI
- Ask one question at a time
- Qualify business fit calmly
- Capture email naturally
- Do not sell aggressively
- Do not mention directory listings
`;

export async function handleAtlasChat(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: ATLAS_SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
  });

  const reply =
    completion.choices?.[0]?.message?.content ??
    "Tell me a little more about your business.";

  return { reply };
}
