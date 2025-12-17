import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length ? t : null;
}

function supabaseAdmin() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const user_type = clean(body.user_type) || "planning";
    const contact_name = clean(body.contact_name);
    const contact_email = clean(body.contact_email);
    const contact_phone = clean(body.contact_phone);
    const contact_company = clean(body.contact_company);
    const website = clean(body.website);

    if (!contact_name && !contact_email && !contact_phone) {
      return NextResponse.json(
        { ok: false, error: "Please provide at least one contact detail." },
        { status: 400 }
      );
    }

    const conversationId = randomUUID();

    const supabase = supabaseAdmin();

    const { error } = await supabase.from("conversations").insert({
      id: conversationId,
      user_type,
      status: "new",
      first_message: null,
      last_message: null,
      contact_name,
      contact_email,
      contact_phone,
      contact_company,
      website,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, conversationId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
