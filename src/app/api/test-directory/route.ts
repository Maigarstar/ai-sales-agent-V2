import { searchDirectory } from "src/lib/edirectory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await searchDirectory({
      location: "London",
      page: 1,
      pageSize: 12,
    });

    // Defensive extraction
    const listings = Array.isArray(result?.items)
      ? result.items
      : [];

    return NextResponse.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    console.error("[test-directory] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}
