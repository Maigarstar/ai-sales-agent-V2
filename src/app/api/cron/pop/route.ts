import { NextResponse } from "next/server";
import { Resend } from "resend";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    /* =========================
       ENV SAFETY (runtime)
    ========================= */
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const CRON_SECRET = process.env.CRON_SECRET;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!RESEND_API_KEY || !OPENAI_API_KEY || !CRON_SECRET || !BASE_URL) {
      return NextResponse.json(
        { error: "Server not configured for CRON execution" },
        { status: 500 }
      );
    }

    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "").trim();

    if (token !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error("Supabase admin client not initialized");
    }

    /* 1. Read inbox */
    const inbox = await fetch(`${BASE_URL}/api/pop-inbox`)
      .then((r) => r.json())
      .catch(() => null);

    if (!inbox?.messages?.length) {
      return NextResponse.json({ status: "No new emails" });
    }

    for (const msg of inbox.messages) {
      try {
        const emailBody = msg.body ?? "";
        const emailFrom = msg.from ?? "";
        const emailSubject = msg.subject ?? "";

        /* 2. AI extraction */
        const extractPrompt = `
You are the Vendor Intake AI for 5 Star Weddings.
Extract ALL vendor details from the email below.

Return ONLY valid JSON.

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

        let extracted: any = {};
        try {
          extracted = JSON.parse(
            aiRes.choices[0]?.message?.content || "{}"
          );
        } catch {
          console.warn("AI returned invalid JSON, skipping email");
          continue;
        }

        if (extracted.spam === true) continue;

        /* 3. Save application */
        const { data: application, error } = await supabase
          .from("vendor_applications")
          .insert({
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
          })
          .select()
          .single();

        if (error || !application) {
          console.error("Insert error:", error?.message);
          continue;
        }

        /* 4. Save raw conversation */
        await supabase.from("vendor_conversations").insert({
          vendor_id: application.id,
          role: "vendor",
          message: emailBody,
        });

        /* 5. Generate luxury reply */
        const replyPrompt = `
Write a luxury, elegant, warm reply as 5 Star Weddings.

Tone: Vogue x Tatler luxury hospitality.
Do not mention AI.

Name: ${extracted.name}
Business: ${extracted.business_name}
`;

        const replyRes = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: replyPrompt }],
        });

        const luxuryReply =
          replyRes.choices[0]?.message?.content || "";

        /* 6. Send reply */
        try {
          await resend.emails.send({
            from: "5 Star Weddings Concierge <tai@5starweddingdirectory.com>",
            to: extracted.email || emailFrom,
            subject: "Thank you for contacting 5 Star Weddings",
            html: `<p>${luxuryReply}</p>`,
          });
        } catch (emailErr) {
          console.error("Reply email failed:", emailErr);
        }

        /* 7. Notify you */
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
          `,
        });
      } catch (loopErr) {
        console.error("Error processing single email:", loopErr);
        continue;
      }
    }

    return NextResponse.json({ status: "Processed vendor emails" });
  } catch (err: any) {
    console.error("CRON pop error:", err);
    return NextResponse.json(
      { error: err.message || "CRON failure" },
      { status: 500 }
    );
  }
}
