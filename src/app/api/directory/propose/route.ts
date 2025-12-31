import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { collection } = await req.json();

    if (!collection || collection.length === 0) {
      return NextResponse.json({ error: "Collection empty" }, { status: 400 });
    }

    // Logic: Email Planners or Save to Database
    console.log("Proposal received for:", collection.map((c: any) => c.title));

    return NextResponse.json({ success: true, message: "Lead Generated" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}