import { NextResponse } from "next/server";
import { Resend } from "resend";

// ✅ ADD THIS IMPORT
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    // ✅ ADMIN CLIENT
    const supabase = getSupabaseAdmin();

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "Missing id or status" },
        { status: 400 }
      );
    }

    // 🔍 Fetch application
    const { data, error: fetchError } = await supabase
      .from("vendor_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { ok: false, error: fetchError?.message || "Application not found" },
        { status: 500 }
      );
    }

    // ✏️ Update status
    const { error: updateError } = await supabase
      .from("vendor_applications")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 📧 Email notifications
    if (status === "approved") {
      await resend.emails.send({
        from: "5 Star Weddings <concierge@5starweddingdirectory.com>",
        to: data.email,
        subject: "Your Application Has Been Approved",
        html: `
          <h2 style="color:#183F34;">Welcome to The 5 Star Weddings Collection</h2>
          <p>Your venue or service has now been approved to join the world’s leading luxury wedding network.</p>
        `,
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
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST /admin/leads/update-vendor-status error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
