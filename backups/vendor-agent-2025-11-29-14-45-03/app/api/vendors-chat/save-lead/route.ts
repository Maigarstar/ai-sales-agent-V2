import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { meta, lastVendorMessage, transcript } = await req.json();

    const { error } = await supabase.from("vendor_leads").insert({
      score: meta.score,
      lead_type: meta.leadType,
      business_category: meta.businessCategory,
      location: meta.location,
      client_budget: meta.clientBudget,
      style: meta.style,
      marketing_channels: meta.marketingChannels,
      last_message: lastVendorMessage,
      transcript,
      created_at: new Date(),
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("Save lead error:", e);
    return NextResponse.json({ ok: false });
  }
}
