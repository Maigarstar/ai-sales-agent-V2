import type { DirectoryItem } from "@/types/edirectory";

/**
 * =========================================================
 * eDirectory API Client Helpers
 * =========================================================
 * These functions talk to your internal Next.js routes under
 * /api/edirectory/... to fetch listings and vendor details.
 * =========================================================
 */

/** -----------------------------------------------
 * Search eDirectory listings (venues, planners, etc.)
 * ---------------------------------------------- */
export async function searchDirectory(params: {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL(`${base}/api/edirectory/search`);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Directory bridge failed with ${res.status}`);

  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Unknown error");

  return {
    ok: true,
    total: data.total || 0,
    page: data.page || 1,
    pageSize: data.pageSize || data.results?.length || 0,
    items: data.results as DirectoryItem[],
  };
}

/** -----------------------------------------------
 * Fetch a single vendor (listing) by ID
 * ---------------------------------------------- */
export async function fetchVendor(id: string): Promise<DirectoryItem> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/edirectory/vendor/${id}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to fetch vendor");
  return data.listing;
}
