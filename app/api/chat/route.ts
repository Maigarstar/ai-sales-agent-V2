import { NextResponse } from "next/server";
import { POST as vendorsPOST } from "./vendors/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Health check: 
 * Allows you to visit /api/chat in the browser to verify the API is alive.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Aura Chat Engine is Active. Requests are forwarded to /api/chat/vendors.",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

/**
 * Forwarder:
 * Automatically takes any POST request sent to /api/chat 
 * and pipes it into the sophisticated vendor logic you've built.
 */
export async function POST(req: Request) {
  // This essentially makes /api/chat an alias for /api/chat/vendors
  return vendorsPOST(req);
}