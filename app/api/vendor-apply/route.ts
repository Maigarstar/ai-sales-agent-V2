import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      business_name,
      website,
      instagram,
      years_in_business,
      location,
      category,
      description,
      message_to_editorial_team,
    } = body;

    // ---------------------------------------------
    // 1. SAVE IN SUPABASE
    // ---------------------------------------------
    const { data, error } = await supabase
      .from("vendor_applications")
      .insert([
        {
          name,
          email,
          phone,
          business_name,
          website,
          instagram,
          years_in_business,
          location,
          category,
          description,
          message_to_editorial_team,
          status: "new",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // ---------------------------------------------
    // 2. SEND EMAIL TO YOU
    // ---------------------------------------------
    const html = `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>New Vendor Application</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Business Name:</strong> ${business_name}</p>
        <p><strong>Website:</strong> ${website}</p>
        <p><strong>Instagram:</strong> ${instagram}</p>

        <p><strong>Years in Business:</strong> ${years_in_business}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Category:</strong> ${category}</p>

        <p><strong>Description:</strong><br>${description}</p>

        <p><strong>Message to Editorial Team:</strong><br>${message_to_editorial_team}</p>

        <hr />
        <p>Application ID: ${data.id}</p>
      </div>
    `;

    await resend.emails.send({
      from: "5 Star Weddings <noreply@5starweddingdirectory.com>",
      to: "tai@5starweddingdirectory.com",
      subject: `New Vendor Application: ${business_name}`,
      html,
    });

    // ---------------------------------------------
    // 3. SEND RESPONSE TO FRONTEND
    // ---------------------------------------------
    return NextResponse.json({
      ok: true,
      id: data.id,
      message: "Vendor application submitted successfully.",
    });

  } catch (err: any) {
    console.error("VENDOR APPLY ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
