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

    const user_type = clean(body.user_type) || "couple"; // "vendor" or "couple"
    const contact_name = clean(body.contact_name);
    const contact_email = clean(body.contact_email);
    const contact_phone = clean(body.contact_phone);

    const venue_or_location = clean(body.venue_or_location);
    const website = clean(body.website);

    // wedding_date can arrive as "YYYY-MM-DD"
    const wedding_date_raw = clean(body.wedding_date);
    const wedding_date = wedding_date_raw ? wedding_date_raw : null;

    if (!contact_name && !contact_email && !contact_phone) {
      return NextResponse.json(
        { ok: false, error: "Please provide at least one contact detail." },
        { status: 400 }
      );
    }

    const conversationId = randomUUID();
    const supabase = supabaseAdmin();

    // Build insert payload
    const insertRow: Record<string, any> = {
      id: conversationId,
      user_type,
      status: "new",
      first_message: null,
      last_message: null,
      contact_name,
      contact_email,
      contact_phone,
      venue_or_location,
      website,
      wedding_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert, if schema has missing columns we retry without them
    const tryInsert = async (row: Record<string, any>) => {
      return await supabase.from("conversations").insert(row);
    };

    let { error } = await tryInsert(insertRow);

    if (error) {
      const msg = (error.message || "").toLowerCase();

      const retryRow = { ...insertRow };

      if (msg.includes("column") && msg.includes("website")) delete retryRow.website;
      if (msg.includes("column") && msg.includes("wedding_date")) delete retryRow.wedding_date;
      if (msg.includes("column") && msg.includes("venue_or_location"))
        delete retryRow.venue_or_location;

      // retry once
      const retry = await tryInsert(retryRow);
      error = retry.error || null;
    }

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