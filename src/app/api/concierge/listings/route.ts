import { NextResponse } from "next/server";
import { searchDirectory } from "src/lib/edirectory";

// GET = quick browser check
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Concierge listings endpoint is live"
  });
}

// POST = Aura data access
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, location, limit = 6 } = body;

    const searchQuery = [query, location].filter(Boolean).join(" ");

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: "Missing search query" },
        { status: 400 }
      );
    }

    const listings = await searchDirectory(searchQuery, limit);

    return NextResponse.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
