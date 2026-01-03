import OpenAI from "openai";
import { assemblePrompt } from "./assemblePrompt";
import { buildLeadContext } from "./buildLeadContext";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAtlasLeadSummary({
  organisationId,
  couple,
  answers,
  availability,
  business
}: {
  organisationId: string;
  couple: any;
  answers: any;
  availability?: any;
  business: any;
}) {
  const context = buildLeadContext({
    couple,
    answers,
    availability,
    business
  });

  const systemPrompt = await assemblePrompt(
    "atlas",
    organisationId,
    context
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: "Generate a concise New Lead Summary for the business."
      }
    ],
    temperature: 0.2
  });

  return completion.choices[0].message.content ?? "";
}
