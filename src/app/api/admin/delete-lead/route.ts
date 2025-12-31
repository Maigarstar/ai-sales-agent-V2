import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for delete lead");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { leadId?: string }
      | null;

    const leadId = body?.leadId;
    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid leadId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase is not configured on the server" },
        { status: 500 }
      );
    }

    // Clear any conversations linked to this lead
    const { error: convError } = await supabase
      .from("conversations")
      .update({ lead_id: null })
      .eq("lead_id", leadId);

    if (convError) {
      console.error("Error clearing conversations.lead_id", convError);
    }

    // Delete vendor_messages rows for this lead
    const { error: vmError } = await supabase
      .from("vendor_messages")
      .delete()
      .eq("lead_id", leadId);

    if (vmError) {
      console.error("Error deleting vendor_messages for lead", vmError);
    }

    // Delete the vendor_leads row
    const { error: leadError } = await supabase
      .from("vendor_leads")
      .delete()
      .eq("id", leadId);

    if (leadError) {
      console.error("Error deleting vendor_leads row", leadError);
      return NextResponse.json(
        {
          ok: false,
          error:
            (leadError as any)?.message ||
            "Could not delete vendor lead row",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE LEAD API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
