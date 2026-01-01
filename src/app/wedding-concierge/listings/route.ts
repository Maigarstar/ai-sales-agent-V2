import { NextResponse } from "next/server";
import { searchDirectory } from "@/lib/edirectory";

// GET for browser testing
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Concierge listings endpoint is live",
  });
}

// POST for Aura Concierge
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

    const result = await searchDirectory({
      q: searchQuery,
      pageSize: limit,
    });

    return NextResponse.json({
      success: true,
      count: result.items.length,
      listings: result.items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
