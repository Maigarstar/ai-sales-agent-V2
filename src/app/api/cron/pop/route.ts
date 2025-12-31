import { NextResponse } from "next/server";
import { Resend } from "resend";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin"; // adjust path if needed

const resend = new Resend(process.env.RESEND_API_KEY!);
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.includes(process.env.CRON_SECRET!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    // 1. Read inbox via POP endpoint
    const inbox = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pop-inbox`)
      .then(r => r.json())
      .catch(() => null);

    if (!inbox || !inbox.messages || inbox.messages.length === 0) {
      return NextResponse.json({ status: "No new emails" });
    }

    const messages = inbox.messages;

    for (const msg of messages) {
      const emailBody = msg.body || "";
      const emailFrom = msg.from || "";
      const emailSubject = msg.subject || "";

      // 2. AI extraction
      const extractPrompt = `
You are the Vendor Intake AI for 5 Star Weddings.
Extract ALL vendor details from the email below.

Return ONLY JSON:

{
  "name": "",
  "email": "",
  "phone": "",
  "business_name": "",
  "website": "",
  "instagram": "",
  "years_in_business": "",
  "category": "",
  "location": "",
  "description": "",
  "message_to_editorial_team": "",
  "spam": false
}

Email content:
${emailBody}
`;

      const aiRes = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: extractPrompt }],
      });

      const extracted = JSON.parse(aiRes.choices[0].message.content || "{}");

      if (extracted.spam === true) continue; // skip spam

      // 3. Save in Supabase
      const { data: application, error: insertError } = await supabase
        .from("vendor_applications")
        .insert([
          {
            name: extracted.name,
            email: extracted.email || emailFrom,
            phone: extracted.phone,
            business_name: extracted.business_name,
            website: extracted.website,
            instagram: extracted.instagram,
            years_in_business: extracted.years_in_business,
            category: extracted.category,
            location: extracted.location,
            description: extracted.description,
            message_to_editorial_team: extracted.message_to_editorial_team,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        continue;
      }

      // 4. Save raw email in conversation
      await supabase.from("vendor_conversations").insert([
        {
          vendor_id: application.id,
          role: "vendor",
          message: emailBody,
        },
      ]);

      // 5. Generate luxury reply
      const replyPrompt = `
Write a luxury, elegant, warm reply as 5 Star Weddings.

Tone: Vogue x Tatler luxury hospitality.
Do not mention AI.

Email details:
Name: ${extracted.name}
Business: ${extracted.business_name}

Reply in natural human style.
`;

      const replyMessage = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: replyPrompt }],
      });

      const luxuryReply = replyMessage.choices[0].message.content;

      // 6. Send reply to vendor
      await resend.emails.send({
        from: "5 Star Weddings Concierge <tai@5starweddingdirectory.com>",
        to: extracted.email || emailFrom,
        subject: "Thank you for contacting 5 Star Weddings",
        html: `<p>${luxuryReply}</p>`,
      });

      // 7. Notify you
      await resend.emails.send({
        from: "5 Star Weddings <tai@5starweddingdirectory.com>",
        to: "tai@5starweddingdirectory.com",
        subject: "New Vendor Application Received",
        html: `
          <h2>New Vendor Application</h2>
          <p><strong>Name:</strong> ${extracted.name}</p>
          <p><strong>Email:</strong> ${extracted.email || emailFrom}</p>
          <p><strong>Business:</strong> ${extracted.business_name}</p>
          <p><strong>Category:</strong> ${extracted.category}</p>
          <p><strong>Location:</strong> ${extracted.location}</p>
          <hr>
          <p>Open Dashboard: https://5starweddingdirectory.com/vendors</p>
        `,
      });
    }

    return NextResponse.json({ status: "Processed vendor emails" });
  } catch (err: any) {
    console.error("CRON /pop error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
