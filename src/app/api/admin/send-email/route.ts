import { NextResponse } from "next/server";
import { sendEmail } from "src/lib/email/resendClient";

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No recipients provided" },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing subject or message" },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: Nunito Sans, sans-serif; padding: 20px;">
        <p>${message.replace(/\n/g, "<br>")}</p>
      </div>
    `;

    const result = await sendEmail({ to, subject, html });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Email sent" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
