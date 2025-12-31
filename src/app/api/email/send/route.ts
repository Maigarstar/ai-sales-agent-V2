import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    // ✅ Correct server-side Supabase client
    const supabase = await createServerSupabase();

    const body = await req.json();
    const { lead_id, to_email, subject, html_body } = body;

    if (!to_email || !subject || !html_body) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // Send email via Resend
    await resend.emails.send({
      from: "5 Star Weddings <noreply@5starweddingdirectory.com>",
      to: [to_email],
      subject,
      html: html_body,
    });

    // Log email to Supabase
    await supabase.from("lead_emails").insert({
      lead_id,
      to_email,
      subject,
      html_body,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Email send failed:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Email send failed" },
      { status: 500 }
    );
  }
}
