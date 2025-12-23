import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { lead_id, to_email, subject, html_body } = body;

    if (!to_email || !subject || !html_body) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // Send via Resend
    await resend.emails.send({
      from: "5 Star Weddings <noreply@5starweddingdirectory.com>",
      to: [to_email],
      subject,
      html: html_body,
    });

    // Log into Supabase
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
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
