// app/api/directory/config/route.ts
import { NextResponse } from "next/server";

const EDIRECTORY_API_BASE = process.env.EDIRECTORY_API_BASE;
const EDIRECTORY_API_KEY = process.env.EDIRECTORY_API_KEY;

export async function GET() {
  try {
    if (!EDIRECTORY_API_BASE || !EDIRECTORY_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Missing eDirectory env vars" },
        { status: 500 }
      );
    }

    const res = await fetch(`${EDIRECTORY_API_BASE}/config.json`, {
      headers: {
        "X-API-KEY": EDIRECTORY_API_KEY,
        Accept: "application/json",
      },
      // optional, but usually good for 3rd party APIs
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `eDirectory error: ${res.status} ${text}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("eDirectory config error", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
