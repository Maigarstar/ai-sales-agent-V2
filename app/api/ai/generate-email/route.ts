import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateEmailPayload = {
  toName?: string;
  venueOrBrandName?: string;
  topic?: string;
  notes?: string;
  replyTo?: string;
};

function safeLine(s?: string) {
  return (s || "").trim();
}

function buildEmail(p: GenerateEmailPayload) {
  const toName = safeLine(p.toName) || "there";
  const brand = safeLine(p.venueOrBrandName) || "your venue";
  const topic = safeLine(p.topic) || "a curated destination spotlight";
  const notes = safeLine(p.notes);

  const subject = `${brand}, ${topic} with 5 Star Weddings`;

  const body =
    `Dear ${toName},\n\n` +
    `I wanted to reach out personally, as ${brand} has long stood out to us as a property of rare charm and distinction.\n\n` +
    `We introduce our brand as 5 Star Weddings, The Luxury Wedding Collection.\n` +
    `We spotlight a select number of iconic venues in our luxury wedding directory, complemented by refined editorial, tailored visibility, and direct introductions to high net worth couples planning celebrations in Paris and beyond.\n\n` +
    (notes ? `A quick note for context, ${notes}\n\n` : "") +
    `If you can share the best wedding contact, I will send a private one page brief with what we would feature and how it would look.\n\n` +
    `Warm regards,\n` +
    `Taiwo`;

  return { subject, body };
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as GenerateEmailPayload;
    const email = buildEmail(payload || {});
    return NextResponse.json({ ok: true, ...email });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Invalid request" },
      { status: 400 }
    );
  }
}
