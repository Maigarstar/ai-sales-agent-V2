import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "POP inbox disabled",
      hint: "Enable IMAP or add a server only mail fetcher later",
    },
    { status: 501 }
  );
}
