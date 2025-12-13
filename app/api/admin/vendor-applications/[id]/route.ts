// app/api/vendor-applications/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase env vars missing in /api/vendor-applications/[id]"
  );
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params?.id;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );
    }

    // id can be uuid string, so we just compare as string
    const { data, error } = await supabase
      .from("vendor_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("SUPABASE GET ERROR vendor_applications/[id]:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      application: data,
    });
  } catch (err: any) {
    console.error(
      "UNCAUGHT ERROR in /api/vendor-applications/[id]:",
      err
    );
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
