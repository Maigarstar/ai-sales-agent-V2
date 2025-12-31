import { NextResponse } from "next/server";
import OpenAI from "openai";

import isVendorIntent from "src/lib/intent/isVendorIntent";
import { handleAtlasChat } from "src/lib/atlas/handleAtlasChat";
import { getEdirectoryHighlights } from "src/lib/edirectory/getHighlights";
import { isReadyForHighlights } from "src/lib/edirectory/isReadyForHighlights";

/* ---------------------------------
   CHAT META TYPE
---------------------------------- */
type ChatMeta = {
  flow: "atlas" | "aura";
  stage?: "discovery" | "qualification" | "recommendation";
  intent?: "vendor" | "couple";
};

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    /* -------------------------------
       VENDOR → ATLAS
    -------------------------------- */
    if (isVendorIntent(message)) {
      const atlas = await handleAtlasChat(message);

      return NextResponse.json({
        ok: true,
        reply: atlas.reply,
        listings: [],
        meta: {
          flow: "atlas",
          intent: "vendor",
          stage: "qualification",
        } satisfies ChatMeta,
      });
    }

    /* -------------------------------
       B2C → AURA
    -------------------------------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `
You are Aura, a refined luxury wedding concierge.
Never mention AI.
Ask clarifying questions before recommending venues.
Speak with elegance and calm authority.
`,
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "Tell me a little more about what you are envisioning.";

    /* -------------------------------
       EDIRECTORY (OPTIONAL)
    -------------------------------- */
    let listings: any[] = [];
    let stage: ChatMeta["stage"] = "discovery";

    if (isReadyForHighlights(reply)) {
      listings = await getEdirectoryHighlights({});
      stage = "recommendation";
    }

    return NextResponse.json({
      ok: true,
      reply,
      listings,
      meta: {
        flow: "aura",
        intent: "couple",
        stage,
      } satisfies ChatMeta,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      ok: false,
      reply: "Let us continue.",
      listings: [],
    });
  }
}
