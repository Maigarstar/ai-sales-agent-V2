import { NextResponse } from "next/server";
import type { DirectoryItem } from "@/types/edirectory"; // ✅ Works if '@' alias is set in tsconfig.json
// If not using alias, use relative import instead:
// import type { DirectoryItem } from "../../../../../types/edirectory";

/** =========================================================
 *  Dynamic Vendor Details Route
 *  Path: /api/edirectory/vendor/[id]
 *  Purpose: Fetch full listing details from eDirectory
 *  ======================================================= */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** =========================================================
 *  Environment Variables
 *  ======================================================= */
const API_BASE = process.env.EDIRECTORY_API_BASE || "";
const API_KEY = process.env.EDIRECTORY_API_KEY || "";
const AUTH_SCHEME = process.env.EDIRECTORY_AUTH_SCHEME || "Bearer";

/** =========================================================
 *  GET /api/edirectory/vendor/[id]
 *  ======================================================= */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!API_BASE || !API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing EDIRECTORY_API_BASE or EDIRECTORY_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // Construct the upstream eDirectory endpoint
    const upstreamUrl = new URL(
      `/api/v2/listings/${encodeURIComponent(id)}`,
      API_BASE.endsWith("/") ? API_BASE : API_BASE + "/"
    );

    // Prepare authentication headers
    const headers: Record<string, string> = { Accept: "application/json" };
    if (AUTH_SCHEME.toLowerCase().startsWith("api")) {
      headers["X-API-KEY"] = API_KEY;
    } else {
      headers["Authorization"] = `${AUTH_SCHEME} ${API_KEY}`;
    }

    // Call the eDirectory API
    const res = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[edirectory vendor] Upstream error:", res.status, text);
      return NextResponse.json(
        { ok: false, error: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();

    // Normalise the upstream response into your internal DirectoryItem format
    const listing: DirectoryItem = {
      id: json.id ?? json.listing_id ?? null,
      title: json.title ?? json.name ?? "",
      description: json.description ?? json.long_description ?? "",
      url:
        json.friendly_url && API_BASE
          ? new URL(json.friendly_url, API_BASE).toString()
          : null,
      images:
        json.images?.length
          ? json.images
          : [json.image_url, json.cover_image, json.thumbnail].filter(Boolean),
      category:
        json.category ||
        json.categories?.[0]?.title ||
        json.categories?.[0]?.name ||
        null,
      location:
        json.location_string ||
        [json.city, json.region, json.country].filter(Boolean).join(", ") ||
        null,
      price_from: json.price_from ?? json.starting_from ?? null,
      rating: json.rating ?? json.review_rating ?? null,
      phone: json.phone ?? json.contact_phone ?? null,
      email: json.email ?? json.contact_email ?? null,
      website: json.url ?? null,
    };

    return NextResponse.json({ ok: true, listing });
  } catch (err: any) {
    console.error("[edirectory vendor] Fatal error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
