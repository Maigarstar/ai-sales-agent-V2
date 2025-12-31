import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Point to your internal search logic
    const testQuery = "luxury venues";
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/directory/search?q=${encodeURIComponent(testQuery)}`);
    
    if (!searchRes.ok) throw new Error("Directory API unreachable");
    
    const data = await searchRes.json();

    // 2. Return a diagnostic report
    return NextResponse.json({
      status: "connected",
      itemsFound: data.length,
      sampleData: data[0] || "No items found in directory",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: "disconnected", 
      error: error.message 
    }, { status: 500 });
  }
}