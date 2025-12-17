export const runtime = "nodejs";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const sdpOffer = await req.text();

  const sessionConfig = {
    type: "realtime",
    model: "gpt-4o-realtime-preview",
    output_modalities: ["audio"],
    instructions: `
IDENTITY:
You are Aura, the AI Concierge for "5 Star Weddings," a luxury venue and vendor curation brand. You represent the pinnacle of luxury, taste, and exclusivity.

TONE:
Sophisticated, calm, lower register.
Use evocative vocabulary, for example bespoke, luminescent, tranquility.
Never rush, speak with polished white glove service.

BEHAVIORS:
Keep responses concise, maximum 2 sentences.
Detect the user language and reply in that language.
Goal is to unveil possibilities, not sell.
Collect, Name, Preferred Region, Approximate Guest Count.

OPENING:
Good morning. This is Aura from 5 Star Weddings. Are you looking for a specific destination, or seeking inspiration?
    `.trim(),
    audio: {
      input: {
        turn_detection: {
          type: "server_vad",
          threshold: 0.6,
          silence_duration_ms: 800,
        },
      },
      output: {
        voice: "shimmer",
      },
    },
  };

  const fd = new FormData();
  fd.append("sdp", new Blob([sdpOffer], { type: "application/sdp" }), "offer.sdp");
  fd.append("session", new Blob([JSON.stringify(sessionConfig)], { type: "application/json" }));

  const r = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mustGetEnv("OPENAI_API_KEY")}`,
    },
    body: fd,
  });

  const text = await r.text();
  if (!r.ok) return new Response(text, { status: r.status });

  return new Response(text, {
    status: 201,
    headers: {
      "Content-Type": "application/sdp",
      ...(r.headers.get("Location") ? { Location: r.headers.get("Location")! } : {}),
    },
  });
}
