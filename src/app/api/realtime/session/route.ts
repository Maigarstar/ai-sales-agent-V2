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
    model: "gpt-realtime",
    audio: { output: { voice: "marin" } },
  };

  const fd = new FormData();
  fd.set("sdp", sdpOffer);
  fd.set("session", JSON.stringify(sessionConfig));

  const r = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mustGetEnv("OPENAI_API_KEY")}`,
    },
    body: fd,
  });

  const sdpAnswer = await r.text();

  return new Response(sdpAnswer, {
    status: r.status,
    headers: {
      "Content-Type": "application/sdp",
      // Optional, forward call id location if you want it
      ...(r.headers.get("Location") ? { Location: r.headers.get("Location")! } : {}),
    },
  });
}
