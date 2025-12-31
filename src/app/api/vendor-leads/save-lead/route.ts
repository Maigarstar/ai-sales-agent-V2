// app/api/vendors-chat/save-lead/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createClient(
      must("NEXT_PUBLIC_SUPABASE_URL"),
      must("SUPABASE_SERVICE_ROLE_KEY")
    );
    await supabase.from("leads").insert({
      full_name: body.name ?? null,
      email: body.email,
      source: body.source ?? "concierge",
      status: "new",
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
