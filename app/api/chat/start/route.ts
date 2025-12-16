import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- Helper Functions ---

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

// --- POST Handler ---

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const body = await req.json().catch(() => ({}));

    const contact_name = clean(body.contact_name ?? body.name);
    const contact_email = clean(body.contact_email ?? body.email);
    const contact_phone = clean(body.contact_phone ?? body.phone);
    
    // 👇 THIS IS THE FIX: We added 'body.venue_or_location' here
    const contact_company = clean(body.contact_company ?? body.company ?? body.venue_or_location);
    
    const user_type = clean(body.user_type) ?? "planning";
    
    // Safety check
    const hasContactInfo = contact_name || contact_email || contact_phone;
    if (!hasContactInfo && !clean(body.first_message)) {
       // Optional: return error logic here if you want
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_type,
        status: "new",
        first_message: clean(body.message) || null,
        last_message: clean(body.message) || null,
        contact_name,
        contact_email,
        contact_phone,
        contact_company, // Now this properly saves your venue/location input!
        wedding_date: clean(body.wedding_date),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase Create Error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, conversationId: data.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}