import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export async function GET() {
  const supabase = supabaseAdmin();

  const tenantId = "TODO_FROM_AUTH"; // wire later

  const { data } = await supabase
    .from("tenant_ai_profiles")
    .select("brand_voice, business_focus, guardrails")
    .eq("tenant_id", tenantId)
    .single();

  return NextResponse.json({ ok: true, profile: data });
}

export async function POST(request: Request) {
  const supabase = supabaseAdmin();
  const tenantId = "TODO_FROM_AUTH";

  const body = await request.json();

  await supabase.from("tenant_ai_profiles").upsert({
    tenant_id: tenantId,
    brand_voice: body.brand_voice,
    business_focus: body.business_focus,
    guardrails: body.guardrails
  });

  return NextResponse.json({ ok: true });
}
