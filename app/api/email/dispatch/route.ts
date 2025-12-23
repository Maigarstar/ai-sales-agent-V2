import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { leadId, subject, personalNote } = await req.json();
    const supabase = getSupabaseAdmin();

    if (!supabase) throw new Error("Database connection failed");

    // 1. Fetch Lead Details (to get their name and email)
    const { data: lead, error: leadError } = await supabase
      .from("vendor_leads")
      .select("name, email, business_category, location")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead not found");

    // 2. Construct the Bespoke HTML
    const html = `
      <div style="font-family: 'Gilda Display', serif; color: #183F34; padding: 40px; border: 1px solid #E1F3EA;">
        <h1 style="font-size: 24px; text-transform: uppercase;">A Personal Recommendation</h1>
        <p style="font-family: 'Nunito Sans', sans-serif; color: #666; font-size: 16px;">
          Dear ${lead.name || 'Valued Guest'},
        </p>
        <p style="font-family: 'Nunito Sans', sans-serif; color: #333; line-height: 1.6;">
          Following your conversation with Aura regarding **${lead.business_category}** in **${lead.location}**, 
          I wanted to personally reach out with a curated selection of opportunities.
        </p>
        <div style="background: #FAFAFA; padding: 20px; border-left: 4px solid #183F34; margin: 20px 0;">
          <p style="font-style: italic; color: #183F34;">${personalNote}</p>
        </div>
        <p style="font-family: 'Nunito Sans', sans-serif; color: #666; font-size: 14px;">
          The 5 Star Weddings Editorial Team
        </p>
      </div>
    `;

    // 3. Send via Resend
    const emailResponse = await resend.emails.send({
      from: "5 Star Weddings <concierge@5starweddingdirectory.com>",
      to: [lead.email],
      subject: subject || `A bespoke update regarding your ${lead.business_category} inquiry`,
      html,
    });

    // 4. Log the success in the database (lead_emails table)
    await supabase.from("lead_emails").insert({
      lead_id: leadId,
      subject: subject,
      body: personalNote,
      recipient: lead.email,
      status: "sent"
    });

    return NextResponse.json({ ok: true, messageId: emailResponse.data?.id });

  } catch (err: any) {
    console.error("DISPATCH ERROR:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}