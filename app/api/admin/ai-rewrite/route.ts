import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    return NextResponse.json(
      {
        ok: false,
        error: "AI rewrite endpoint is not configured yet",
        received: body,
      },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, status: "AI rewrite endpoint is live" },
    { status: 200 }
  );
}
