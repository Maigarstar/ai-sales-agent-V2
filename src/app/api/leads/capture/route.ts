import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/createLead";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      organisationId,
      couple,
      answers,
      availability,
      business
    } = body;

    if (!organisationId || !couple || !answers || !business) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const lead = await createLead({
      organisationId,
      couple,
      answers,
      availability,
      business
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id
    });
  } catch (error: any) {
    console.error("Lead capture failed", error);

    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
