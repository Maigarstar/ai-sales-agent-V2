import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // use service role if present, fall back to anon as a safety net
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const body = await req.json();
    const messages = body.messages as ChatMessage[] | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          reply:
            "Tell me a little about your wedding business, venue or brand so I can guide you.",
          metadata: null,
        },
        { status: 200 }
      );
    }

    const lastUser = [...messages].reverse().find(
      (m) => m.role === "user"
    );

    let replyText =
      "I am here and ready to help with your wedding business.";
    let metadata: any = null;

    if (!apiKey) {
      const lastText = lastUser?.content ?? "your message";
      replyText = `Developer note, OPENAI_API_KEY is missing so I am running in test mode. I received: "${lastText}".`;
    } else {
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `
You are the AI Vendor Qualification Assistant for 5 Star Weddings.

Return valid JSON in this exact shape only:

{
  "reply": "natural sentence the vendor reads",
  "metadata": {
    "score": number,
    "lead_type": "Hot" | "Warm" | "Cold",
    "business_category": string | null,
    "location": string | null,
    "client_budget": string | null,
    "follow_up_next_step": string | null
  }
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.4,
      });

      const rawContent =
        completion.choices[0]?.message?.content ?? "{}";

      let parsed: { reply?: string; metadata?: any } = {};
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        parsed = {};
      }

      replyText =
        parsed.reply?.toString().trim() ||
        "I am here and ready to help with your vendor onboarding.";
      metadata = parsed.metadata ?? null;
    }

    // write to Supabase if keys are set
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1) store raw chat messages in vendor_chat_messages
      const rows: any[] = [];

      if (lastUser) {
        rows.push({
          role: "user",
          content: lastUser.content,
        });
      }

      rows.push({
        role: "assistant",
        content: replyText,
      });

      const { error: chatError } = await supabase
        .from("vendor_chat_messages")
        .insert(rows);

      if (chatError) {
        console.error("Supabase insert error (vendor_chat_messages)", chatError);
      }

      // 2) if we have useful metadata, also store a lead row
      if (metadata) {
        const leadType = metadata.lead_type as string | null;
        const rawScore = metadata.score;
        const score =
          typeof rawScore === "number" ? rawScore : null;
        const businessCategory =
          (metadata.business_category as string | null) ?? null;
        const location =
          (metadata.location as string | null) ?? null;

        // basic rule, only save Warm or Hot leads
        const shouldSave =
          !!leadType &&
          (leadType === "Warm" || leadType === "Hot");

        if (shouldSave) {
          const { error: leadError } = await supabase
            .from("vendor_leads")
            .insert([
              {
                lead_type: leadType,
                score,
                business_category: businessCategory,
                location,
              },
            ]);

          if (leadError) {
            console.error("Supabase insert error (vendor_leads)", leadError);
          }
        }
      }
    }

    return NextResponse.json(
      {
        reply: replyText,
        metadata,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("VENDORS CHAT API ERROR:", err);

    const devMessage = `Developer error, ${err?.message || "unknown error"}. Check the server console.`;

    return NextResponse.json(
      {
        reply: devMessage,
        metadata: null,
      },
      { status: 200 }
    );
  }
}
