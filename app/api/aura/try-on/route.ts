// app/api/aura/try-on/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Initialize Supabase with the request cookies
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: async () => {},
          remove: async () => {},
        },
      }
    );

    // ✅ Get the authenticated session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const userImage = formData.get("image") as File | null;
    const styleId = formData.get("style_id") as string | null;

    if (!userImage || !styleId) {
      return NextResponse.json(
        { ok: false, error: "Missing image or style ID" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await userImage.arrayBuffer());
    const fileName = `uploads/${randomUUID()}-${userImage.name}`;

    // ✅ Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user_uploads")
      .upload(fileName, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: userImage.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { ok: false, error: "Image upload failed" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("user_uploads")
      .getPublicUrl(fileName);

    const uploadedImageUrl = publicUrlData?.publicUrl;

    // ✅ Simulate AI generation (placeholder logic)
    const generatedUrl = `${uploadedImageUrl}?ai_render=true`;

    // ✅ Store generation metadata in database (optional)
    await supabase.from("aura_sessions").insert({
      user_id: session.user.id,
      style_id: styleId,
      image_url: uploadedImageUrl,
      result_url: generatedUrl,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      result_url: generatedUrl,
    });
  } catch (error) {
    console.error("Aura Try-On Error:", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
