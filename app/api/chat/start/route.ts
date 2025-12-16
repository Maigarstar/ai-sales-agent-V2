import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const supabase = supabaseAdmin();
    const body = await req.json().catch(() => ({}));

    // Accept multiple possible frontend key names
    const contact_name = clean(body.contact_name ?? body.name ?? body.fullName);
    const contact_email = clean(body.contact_email ?? body.email);
    const contact_phone = clean(body.contact_phone ?? body.phone ?? body.telephone);

    const venue_or_location = clean(
      body.venue_or_location ?? body.venueOrLocation ?? body.venue ?? body.location
    );

    const contact_company = clean(
      body.contact_company ?? body.company ?? body.contactCompany ?? venue_or_location
    );

    const wedding_date = clean(body.wedding_date ?? body.weddingDate ?? body.date);

    const user_type = clean(body.user_type ?? body.userType) ?? "planning";

    const first_message = clean(body.message ?? body.first_message ?? body.firstMessage) || null;

    const rowToInsert: Record<string, any> = {
      user_type,
      status: "new",
      first_message,
      last_message: first_message,
      contact_name,
      contact_email,
      contact_phone,
      contact_company,
      wedding_date,
      updated_at: new Date().toISOString(),
    };

    // If the column exists, save it too (safe attempt)
    // If it does not exist, we will ignore the error and re-try without it.
    const tryInsertWithVenue = venue_or_location
      ? { ...rowToInsert, venue_or_location }
      : rowToInsert;

    let data: any = null;

    const attempt1 = await supabase
      .from("conversations")
      .insert(tryInsertWithVenue)
      .select(
        "id, contact_name, contact_email, contact_phone, contact_company, wedding_date, created_at"
      )
      .single();

    if (attempt1.error) {
      // If venue_or_location column is missing, retry without it
      const msg = attempt1.error.message || "";
      const venueColumnMissing =
        msg.includes("venue_or_location") && msg.toLowerCase().includes("does not exist");

      if (venueColumnMissing) {
        const attempt2 = await supabase
          .from("conversations")
          .insert(rowToInsert)
          .select(
            "id, contact_name, contact_email, contact_phone, contact_company, wedding_date, created_at"
          )
          .single();

        if (attempt2.error) {
          return NextResponse.json(
            {
              ok: false,
              error: attempt2.error.message,
              received: body,
              attempted: rowToInsert,
            },
            { status: 500 }
          );
        }

        data = attempt2.data;
      } else {
        return NextResponse.json(
          {
            ok: false,
            error: attempt1.error.message,
            received: body,
            attempted: tryInsertWithVenue,
          },
          { status: 500 }
        );
      }
    } else {
      data = attempt1.data;
    }

    return NextResponse.json({
      ok: true,
      conversationId: data.id,
      inserted: data,
      received: body,
      saved: {
        contact_name,
        contact_email,
        contact_phone,
        venue_or_location,
        contact_company,
        wedding_date,
        user_type,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
