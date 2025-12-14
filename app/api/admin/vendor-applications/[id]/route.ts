import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  try {
    // your existing logic, keep it
    return NextResponse.json({ ok: true, application: null });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message ?? error) }, { status: 500 });
  }
}
