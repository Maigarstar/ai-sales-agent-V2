import { NextResponse } from "next/server";

/* ---------------------------------
   SIGNAL DETECTION (QUIET, INFERRED)
---------------------------------- */
function detectSignals(message: string) {
  const text = message.toLowerCase();

  return {
    decisionMaker: /(owner|founder|director|general manager|gm|principal)/i.test(text),
    internationalFocus: /(destination|international|uk|usa|american|middle east|uae)/i.test(text),
    editorialReady: /(editorial|styled shoot|press|featured|publication)/i.test(text),
    massMarket: /(listed everywhere|all platforms|discount|cheap|budget)/i.test(text),
  };
}

/* ---------------------------------
   ATLAS LEAD SCORING ENGINE (EXPANDED)
---------------------------------- */
function calculateLeadScore(data: any, signals: any) {
  let score = 0;

  // 1. Luxury positioning
  if (data.luxuryPositioning) score += 20;

  // 2. Prime destinations
  const primeLocations = [
    // Italy
    "lake como", "como", "tuscany", "florence", "rome",
    "amalfi", "positano", "ravello", "capri", "sicily",
    // France
    "paris", "provence", "french riviera", "monaco",
    // Spain & Portugal
    "ibiza", "mallorca", "barcelona", "lisbon", "algarve",
    // Switzerland
    "st moritz", "zermatt", "geneva",
    // Greece
    "santorini", "mykonos", "athens",
    // Middle East
    "dubai", "abu dhabi", "doha",
    // Caribbean
    "st barths", "bahamas", "barbados",
    // USA
    "napa", "sonoma", "new york", "california"
  ];

  if (primeLocations.some(loc => data.location?.toLowerCase().includes(loc))) {
    score += 20;
  }

  // 3. Iconic luxury brands
  const luxuryBrands = [
    "four seasons", "ritz-carlton", "st regis", "aman",
    "rosewood", "belmond", "dorchester", "mandarin oriental",
    "six senses", "fairmont", "raffles", "banyan tree",
    "cheval blanc"
  ];

  if (
    luxuryBrands.some(b =>
      data.businessName?.toLowerCase().includes(b) ||
      data.website?.toLowerCase().includes(b)
    )
  ) {
    score += 15;
  }

  // 4. Strategic category gaps
  const strategicCategories = [
    "planner", "destination planner",
    "videography", "film", "drone",
    "luxury florist", "celebrant", "stylist"
  ];

  if (strategicCategories.some(c => data.category?.toLowerCase().includes(c))) {
    score += 15;
  }

  // 5. Intent timing
  if (data.intentTiming === "immediate") score += 15;
  if (data.intentTiming === "planning") score += 8;

  // 6. Digital maturity
  if (data.website) score += 10;

  // 7. Decision maker bonus
  if (signals.decisionMaker) score += 10;

  // 8. International readiness
  if (signals.internationalFocus) score += 10;

  // 9. Editorial readiness
  if (signals.editorialReady) score += 10;

  // 10. Mass-market penalty
  if (signals.massMarket) score -= 15;

  return Math.max(score, 0);
}

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
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        system:
          "You are Atlas, partnerships lead for 5 Star Weddings. Speak with calm authority. Ask one question at a time. Never pitch. Qualify discreetly.",
        messages: [
          ...conversationHistory,
          { role: "user", content: message },
        ],
        tools: [
          {
            name: "capture_lead",
            description: "Capture qualified luxury partner",
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

    let reply =
      content.find((b: any) => b.type === "text")?.text ??
      "Tell me a little more about your business.";

    const toolUse = content.find((b: any) => b.type === "tool_use");

    let atlasResult: any = {
      reply,
      stage: "qualification",
      persona: "b2b",
    };

    if (toolUse?.name === "capture_lead") {
      const input = toolUse.input;
      const finalScore = calculateLeadScore(input, signals);
      const priority =
        finalScore >= 80 ? "HOT" : finalScore >= 50 ? "WARM" : "COLD";

      if (priority === "HOT") {
        console.log(`🔥 ATLAS ALERT: Priority partner – ${input.businessName}`);
        // Email / Slack hook goes here
      }

      atlasResult = {
        reply:
          finalScore >= 80
            ? "Thank you for sharing your vision. This feels aligned with the partners we work with. A member of our partnerships team will be in touch privately to explore next steps."
            : "Thank you for taking the time to share your business. We will review the details and follow up accordingly.",
        businessName: input.businessName,
        category: input.category,
        location: input.location,
        contactName: input.contactName,
        contactEmail: input.email,
        website: input.website,
        stage: "intent",
        score: finalScore,
        priority,
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
