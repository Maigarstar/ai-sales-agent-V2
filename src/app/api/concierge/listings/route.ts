import { NextResponse } from "next/server";
// Use the '@' alias for professional VPS pathing
import { searchDirectory } from "@/lib/edirectory";

export const dynamic = "force-dynamic";

/* ---------------------------------
   GET = health check
---------------------------------- */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Concierge listings endpoint is live",
  });
}

/* ---------------------------------
   POST = Aura listings search
---------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, location, limit = 6 } = body;

    // We still combine these for the 'q' parameter if needed, 
    // or pass them separately into the object.
    const searchQuery = [query, location].filter(Boolean).join(" ");

    if (!searchQuery.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing search query" },
        { status: 400 }
      );
    }

    /**
     * ✅ THE FIX: 
     * The error says 'searchDirectory' expects an object, not a string.
     * We wrap the query into the 'q' property of that object.
     */
    const result = await searchDirectory({ 
      q: searchQuery,
      location: location, // Optional: passing location separately if your lib supports it
      pageSize: limit 
    });

    // 🔒 Normalize response (Handling both object-wrapped and array-direct responses)
    const allListings = Array.isArray(result?.items)
      ? result.items
      : Array.isArray(result)
      ? result
      : [];

    // Apply limit for luxury UI consistency
    const listings = allListings.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: result?.total ?? allListings.length,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    console.error("Concierge listings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}