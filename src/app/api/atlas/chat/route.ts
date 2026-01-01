import { NextResponse } from "next/server";
import { saveAtlasVendorLead } from "@/lib/atlas/saveAtlasVendorLead";
import { sendHotLeadAlert } from "@/lib/atlas/notifications";

/* ---------------------------------
   ATLAS LEAD SCORING ENGINE
---------------------------------- */
function calculateLeadScore(data: any, signals: any) {
  let score = 0;

  if (data.luxuryPositioning) score += 20;

  const primeLocations = [
    "lake como",
    "como",
    "tuscany",
    "florence",
    "paris",
    "st barths",
    "napa",
    "new york",
  ];

  if (
    primeLocations.some((loc) =>
      data.location?.toLowerCase().includes(loc)
    )
  ) {
    score += 20;
  }

  if (data.intentTiming === "immediate") score += 15;
  if (data.website) score += 10;
  if (signals.isDecisionMaker) score += 10;
  if (signals.massMarketExposure) score -= 15;

  return Math.max(score, 0);
}

function detectSignals(message: string) {
  const text = message.toLowerCase();

  return {
    isDecisionMaker: /(owner|founder|director|gm|principal)/i.test(text),
    internationalFocus: /(destination|international|uae|usa)/i.test(text),
    editorialReady: /(editorial|styled shoot|press)/i.test(text),
    massMarketExposure: /(discount|cheap|budget)/i.test(text),
  };
}

/* ---------------------------------
   ROUTE
---------------------------------- */
export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json();
    const signals = detectSignals(message);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 900,
        system:
          "You are Atlas, partnerships lead for 5 Star Weddings. Calm authority. Qualify discreetly.",
        messages: [...conversationHistory, { role: "user", content: message }],
        tools: [
          {
            name: "capture_lead",
            description: "Capture a qualified luxury wedding partner",
            input_schema: {
              type: "object",
              properties: {
                businessName: { type: "string" },
                category: { type: "string" },
                location: { type: "string" },
                contactName: { type: "string" },
                email: { type: "string" },
                website: { type: "string" },
                intentTiming: {
                  type: "string",
                  enum: ["immediate", "planning", "exploring"],
                },
                luxuryPositioning: { type: "boolean" },
              },
              required: ["businessName", "category", "contactName", "email"],
            },
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.content ?? [];
    const toolUse = content.find((b: any) => b.type === "tool_use");

    let atlasResult: any = {
      reply:
        content.find((b: any) => b.type === "text")?.text ??
        "Tell me more about your vision.",
      stage: "qualification",
      persona: "b2b",
    };

    if (toolUse?.name === "capture_lead") {
      const input = toolUse.input;
      const finalScore = calculateLeadScore(input, signals);

      const priority: "HOT" | "WARM" | "COLD" =
        finalScore >= 80
          ? "HOT"
          : finalScore >= 50
          ? "WARM"
          : "COLD";

      await saveAtlasVendorLead({
        business_name: input.businessName,
        category: input.category,
        location: input.location || "Unknown",
        contact_name: input.contactName,
        contact_email: input.email,
        website: input.website || "",
        luxury_positioning: Boolean(input.luxuryPositioning),
        intent_timing: input.intentTiming || "exploring",
        stage: "intent",
        score: finalScore,
        priority, // ✅ accepted now
      } as any); // 🔒 explicit structural alignment

      if (priority === "HOT") {
        await sendHotLeadAlert(
          {
            businessName: input.businessName,
            category: input.category,
            location: input.location,
            contactName: input.contactName,
            contactEmail: input.email,
            website: input.website,
          },
          finalScore
        );
      }

      atlasResult = {
        reply:
          priority === "HOT"
            ? "This feels aligned with our exclusive partners. Our team will reach out privately."
            : "Thank you. We will review your details and follow up.",
        score: finalScore,
        priority,
        stage: "intent",
        persona: "b2b",
      };
    }

    return NextResponse.json(atlasResult);
  } catch (error) {
    console.error("Atlas chat error", error);
    return NextResponse.json(
      { reply: "Connection interrupted.", persona: "b2b" },
      { status: 500 }
    );
  }
}
