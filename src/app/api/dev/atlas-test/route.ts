import { NextResponse } from "next/server";
import { generateAtlasLeadSummary } from "@/lib/ai/generateAtlasLeadSummary";

export async function GET() {
  try {
    const summary = await generateAtlasLeadSummary({
      organisationId: "test-organisation-id",
      couple: {
        wedding_date_range: "September 2026",
        location: "Tuscany"
      },
      answers: {
        aesthetic: "Modern Minimalist",
        budget: "£50k–£100k"
      },
      availability: {
        status: "limited",
        priority_dates: ["14 September", "21 September"]
      },
      business: {
        business_name: "Villa Example"
      }
    });

    return NextResponse.json({
      ok: true,
      summary
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
