import { searchDirectory } from "src/lib/edirectory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const listings = await searchDirectory("London");

    return NextResponse.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
