import { NextResponse } from "next/server";
import type { DirectoryItem } from "@/types/directory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = process.env.DIRECTORY_API_BASE || "";
const API_KEY = process.env.DIRECTORY_API_KEY || "";
const AUTH_SCHEME = process.env.DIRECTORY_AUTH_SCHEME || "Bearer";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!API_BASE || !API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing DIRECTORY_API_BASE or DIRECTORY_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const upstreamUrl = new URL(
      `/api/v2/listings/${encodeURIComponent(id)}`,
      API_BASE.endsWith("/") ? API_BASE : API_BASE + "/"
    );

    const headers: Record<string, string> = { Accept: "application/json" };
    if (AUTH_SCHEME.toLowerCase().startsWith("api")) {
      headers["X-API-KEY"] = API_KEY;
    } else {
      headers["Authorization"] = `${AUTH_SCHEME} ${API_KEY}`;
    }

    const res = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[directory vendor] Upstream error:", res.status, text);
      return NextResponse.json(
        { ok: false, error: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();

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
    console.error("[directory vendor] Fatal error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
