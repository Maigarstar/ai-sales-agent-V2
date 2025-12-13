import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { id, status } = await req.json();

  const { data } = await supabase
    .from("vendor_applications")
    .select("*")
    .eq("id", id)
    .single();

  await supabase
    .from("vendor_applications")
    .update({ status })
    .eq("id", id);

  if (status === "approved") {
    await resend.emails.send({
      from: "5 Star Weddings <concierge@5starweddingdirectory.com>",
      to: data.email,
      subject: "Your Application Has Been Approved",
      html: `
        <h2 style="color:#183F34;">Welcome to The 5 Star Weddings Collection</h2>
        <p>Your venue or service has now been approved to join the world’s leading luxury wedding network.</p>
      `
    });
  }

  if (status === "declined") {
    await resend.emails.send({
      from: "5 Star Weddings <concierge@5starweddingdirectory.com>",
      to: data.email,
      subject: "Your Application Result",
      html: `
        <h3>Thank you for your application</h3>
        <p>After careful review, we are unable to approve your submission at this time.</p>
      `
    });
  }

  return NextResponse.json({ success: true });
}
