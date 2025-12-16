import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- Helper Functions ---

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function toNullIfBlank(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length ? t : null;
}

function hasOwn(obj: any, key: string) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

function supabaseAdmin() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// --- GET Handler ---

export async function GET(
  req: Request,
  // 🚀 FUTURE PROOF: Handles both Promise (Next 15+) and Object (Legacy)
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin();
    // Safely unwrap the params regardless of type
    const { id } = await params;

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        user_type,
        status,
        first_message,
        last_message,
        created_at,
        updated_at,
        contact_name,
        contact_email,
        contact_phone,
        contact_company,
        wedding_date
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, conversation: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// --- PATCH Handler ---

export async function PATCH(
  req: Request,
  // 🚀 FUTURE PROOF: Handles both Promise (Next 15+) and Object (Legacy)
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin();
    // Safely unwrap the params regardless of type
    const { id } = await params;

    const body = await req.json().catch(() => ({}));

    const patch: Record<string, any> = {};

    if (hasOwn(body, "contact_name")) {
      const v = toNullIfBlank(body.contact_name);
      if (v !== undefined) patch.contact_name = v;
    }
    if (hasOwn(body, "contact_email")) {
      const v = toNullIfBlank(body.contact_email);
      if (v !== undefined) patch.contact_email = v;
    }
    if (hasOwn(body, "contact_phone")) {
      const v = toNullIfBlank(body.contact_phone);
      if (v !== undefined) patch.contact_phone = v;
    }
    if (hasOwn(body, "contact_company")) {
      const v = toNullIfBlank(body.contact_company);
      if (v !== undefined) patch.contact_company = v;
    }
    if (hasOwn(body, "wedding_date")) {
      const v = toNullIfBlank(body.wedding_date);
      if (v !== undefined) patch.wedding_date = v;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("conversations")
      .update(patch)
      .eq("id", id)
      .select(`
        id,
        user_type,
        status,
        first_message,
        last_message,
        created_at,
        updated_at,
        contact_name,
        contact_email,
        contact_phone,
        contact_company,
        wedding_date
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, conversation: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}