import { NextResponse } from "next/server";

/** =========================================================
 *  Dynamic route, no caching
 *  ======================================================= */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** =========================================================
 *  Env
 *  Required:
 *    EDIRECTORY_API_BASE  for example https://5starweddingdirectory.com
 *    EDIRECTORY_API_KEY   your eDirectory API key or token
 *  Optional:
 *    EDIRECTORY_API_PATH  default /api/v2/listings/search
 *    EDIRECTORY_AUTH_SCHEME  default Bearer, can be ApiKey
 *  ======================================================= */
const API_BASE = process.env.EDIRECTORY_API_BASE || "";
const API_KEY = process.env.EDIRECTORY_API_KEY || "";
const API_PATH = process.env.EDIRECTORY_API_PATH || "/api/v2/listings/search";
const AUTH_SCHEME = process.env.EDIRECTORY_AUTH_SCHEME || "Bearer";

/** Make upstream URL safely */
function buildUpstreamURL(params: {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) {
  if (!API_BASE) throw new Error("Missing EDIRECTORY_API_BASE");
  const u = new URL(API_PATH, API_BASE.endsWith("/") ? API_BASE : API_BASE + "/");
  if (params.q) u.searchParams.set("q", params.q);
  if (params.category) u.searchParams.set("category", params.category);
  if (params.location) u.searchParams.set("location", params.location);
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.pageSize) u.searchParams.set("page_size", String(params.pageSize));
  return u;
}

/** Normaliser, adapt to your eDirectory payload shape */
function normaliseResults(payload: any) {
  const items = Array.isArray(payload?.results || payload?.data || payload?.items)
    ? payload.results || payload.data || payload.items
    : [];

  const results = items.map((it: any) => {
    // Try a few likely field names
    const id = it.id ?? it.listing_id ?? it.guid ?? null;
    const title = it.title ?? it.name ?? it.label ?? "";
    const slug = it.friendly_url ?? it.slug ?? null;
    const url =
      it.url ||
      (slug && API_BASE ? new URL(slug.startsWith("/") ? slug.slice(1) : slug, API_BASE + "/").toString() : null);
    const location =
      it.location_string ||
      it.location ||
      [it.city, it.region, it.country].filter(Boolean).join(", ") ||
      null;
    const category =
      it.category || it.categories?.[0]?.title || it.categories?.[0]?.name || null;
    const image =
      it.image_url ||
      it.cover_image ||
      it.thumbnail ||
      it.images?.[0] ||
      null;
    const price_from =
      it.price_from || it.starting_from || it.min_price || null;
    const rating =
      it.rating || it.review_rating || null;
    const contact_phone = it.phone || it.contact_phone || null;
    const contact_email = it.email || it.contact_email || null;

    return {
      id,
      title,
      slug,
      url,
      location,
      category,
      image,
      price_from,
      rating,
      contact_phone,
      contact_email,
      raw: it,
    };
  });

  const total =
    payload?.total ||
    payload?.pagination?.total ||
    (Array.isArray(items) ? items.length : 0);

  const page =
    payload?.page ||
    payload?.pagination?.page ||
    null;

  const pageSize =
    payload?.page_size ||
    payload?.pagination?.page_size ||
    null;

  return { results, total, page, pageSize, upstream: payload };
}

/** Read params from POST body or GET query */
async function readParams(req: Request) {
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    return {
      q: typeof body.q === "string" ? body.q : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      location: typeof body.location === "string" ? body.location : undefined,
      page: Number.isFinite(body.page) ? Number(body.page) : undefined,
      pageSize: Number.isFinite(body.pageSize) ? Number(body.pageSize) : undefined,
    };
  }
  const u = new URL(req.url);
  return {
    q: u.searchParams.get("q") || undefined,
    category: u.searchParams.get("category") || undefined,
    location: u.searchParams.get("location") || undefined,
    page: u.searchParams.get("page") ? Number(u.searchParams.get("page")) : undefined,
    pageSize: u.searchParams.get("pageSize") ? Number(u.searchParams.get("pageSize")) : undefined,
  };
}

/** Common handler */
async function handle(req: Request) {
  try {
    if (!API_KEY) {
      console.error("[directory search] Missing EDIRECTORY_API_KEY");
      return NextResponse.json(
        { ok: false, error: "Server is missing EDIRECTORY_API_KEY" },
        { status: 500 }
      );
    }
    if (!API_BASE) {
      console.error("[directory search] Missing EDIRECTORY_API_BASE");
      return NextResponse.json(
        { ok: false, error: "Server is missing EDIRECTORY_API_BASE" },
        { status: 500 }
      );
    }

    const params = await readParams(req);
    const upstreamURL = buildUpstreamURL(params);

    // Prepare headers, allow simple switch of auth scheme
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (AUTH_SCHEME.toLowerCase() === "apikey" || AUTH_SCHEME.toLowerCase() === "api_key") {
      headers["X-API-KEY"] = API_KEY;
    } else {
      headers["Authorization"] = `${AUTH_SCHEME} ${API_KEY}`;
    }

    const res = await fetch(upstreamURL.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[directory search] Upstream returned non JSON", text?.slice(0, 300));
      return NextResponse.json(
        { ok: false, error: "Upstream did not return JSON" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      console.error("[directory search] Upstream error", res.status, json);
      return NextResponse.json(
        { ok: false, status: res.status, error: json?.error || "Upstream error" },
        { status: 502 }
      );
    }

    const normalised = normaliseResults(json);

    return NextResponse.json({ ok: true, ...normalised });
  } catch (err: any) {
    console.error("[directory search] Fatal error", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}

/** Export GET and POST */
export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
