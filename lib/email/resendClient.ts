import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// THE function we MUST export
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  try {
    const response = await resend.emails.send({
      from: "5 Star Weddings <tai@5starweddingdirectory.com>",
      to,
      subject,
      html,
    });

    return { ok: true, response };
  } catch (error) {
    console.error("sendEmail ERROR:", error);
    return { ok: false, error };
  }
}
