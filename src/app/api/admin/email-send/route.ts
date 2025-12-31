import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY");
}

const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipients, subject, message } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No recipients provided" },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Convert textarea newlines to <p> paragraphs for HTML email
    const htmlMessage = message
      .split("\n")
      .map((line: string) => `<p>${line}</p>`)
      .join("");

    const sendTo = Array.isArray(recipients)
      ? recipients
      : recipients.split(/[\n,]+/).map((r: string) => r.trim());

    const response = await resend.emails.send({
      from: "Taiwo at 5 Star Weddings <hello@5starweddingdirectory.com>",
      to: sendTo,
      subject,
      html: htmlMessage,
    });

    return NextResponse.json({ ok: true, response });
  } catch (err: any) {
    console.error("Email send error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
