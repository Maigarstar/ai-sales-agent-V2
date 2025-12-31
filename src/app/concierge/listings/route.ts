import { NextResponse } from "next/server";
import { searchDirectory } from "src/lib/edirectory";
import { normalizeEDirectoryListing } from "src/lib/edirectory/normalizeListing";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) {
    return NextResponse.json({ ok: true, listings: [] });
  }

  try {
    const raw = await searchDirectory(q);

    const listings = raw
      .map(item =>
        normalizeEDirectoryListing(
          item,
          "https://5starweddingdirectory.com"
        )
      )
      .filter(Boolean);

    return NextResponse.json({ ok: true, listings });
  } catch (error: any) {
    console.error("Concierge search error:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
