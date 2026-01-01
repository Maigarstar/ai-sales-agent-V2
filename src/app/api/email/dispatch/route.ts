import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const resend = new Resend(RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { leadId, subject, personalNote } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { ok: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error("Supabase admin client not initialized");
    }

    // 1. Fetch Lead Details
    const { data: lead, error: leadError } = await supabase
      .from("vendor_leads")
      .select("name, email, business_category, location")
      .eq("id", leadId)
      .single();

    if (leadError || !lead || !lead.email) {
      throw new Error("Lead not found or missing email");
    }

    // 2. Construct the Bespoke HTML
    const html = `
      <div style="font-family: 'Gilda Display', serif; color: #183F34; padding: 40px; border: 1px solid #E1F3EA;">
        <h1 style="font-size: 24px; text-transform: uppercase;">A Personal Recommendation</h1>

        <p style="font-family: 'Nunito Sans', sans-serif; color: #666; font-size: 16px;">
          Dear ${lead.name || "Valued Guest"},
        </p>

        <p style="font-family: 'Nunito Sans', sans-serif; color: #333; line-height: 1.6;">
          Following your conversation with Aura regarding
          <strong>${lead.business_category || "your enquiry"}</strong>
          in <strong>${lead.location || "your chosen destination"}</strong>,
          I wanted to personally reach out with a curated update.
        </p>

        ${
          personalNote
            ? `<div style="background: #FAFAFA; padding: 20px; border-left: 4px solid #183F34; margin: 20px 0;">
                <p style="font-style: italic; color: #183F34;">${personalNote}</p>
              </div>`
            : ""
        }

        <p style="font-family: 'Nunito Sans', sans-serif; color: #666; font-size: 14px;">
          The 5 Star Weddings Editorial Team
        </p>
      </div>
    `;

    // 3. Send via Resend
    const emailResponse = await resend.emails.send({
      from: "5 Star Weddings <concierge@5starweddingdirectory.com>",
      to: lead.email,
      subject:
        subject ||
        `A bespoke update regarding your ${lead.business_category || "wedding"} enquiry`,
      html,
    });

    // 4. Log the email
    await supabase.from("lead_emails").insert({
      lead_id: leadId,
      subject:
        subject ||
        `A bespoke update regarding your ${lead.business_category || "wedding"} enquiry`,
      body: personalNote || "",
      recipient: lead.email,
      status: "sent",
    });

    return NextResponse.json({
      ok: true,
      messageId: emailResponse.data?.id || null,
    });
  } catch (err: any) {
    console.error("DISPATCH ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
