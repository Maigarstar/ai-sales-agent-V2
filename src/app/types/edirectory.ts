import type { DirectoryItem } from "@/types/edirectory";

/**
 * =========================================================
 * eDirectory API Client Helpers
 * =========================================================
 * These functions talk to your internal Next.js routes under
 * /api/edirectory/... to fetch listings and vendor details.
 * =========================================================
 */

type SearchDirectoryResponse = {
  ok: true;
  total: number;
  page: number;
  pageSize: number;
  items: DirectoryItem[];
};

/** -----------------------------------------------
 * Search eDirectory listings (venues, planners, etc.)
 * ---------------------------------------------- */
export async function searchDirectory(params: {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}): Promise<SearchDirectoryResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL("/api/edirectory/search", base);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Directory bridge failed with ${res.status}`);
  }

  const data = await res.json();

  if (!data?.ok || !Array.isArray(data.results)) {
    throw new Error(data?.error || "Invalid directory response");
  }

  return {
    ok: true,
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    pageSize: Number(data.pageSize) || data.results.length || 0,
    items: data.results as DirectoryItem[],
  };
}

/** -----------------------------------------------
 * Fetch a single vendor (listing) by ID
 * ---------------------------------------------- */
export async function fetchVendor(id: string): Promise<DirectoryItem> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    new URL(`/api/edirectory/vendor/${id}`, base).toString(),
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Vendor fetch failed with ${res.status}`);
  }

  const data = await res.json();

  if (!data?.ok || !data.listing) {
    throw new Error(data?.error || "Invalid vendor response");
  }

  return data.listing as DirectoryItem;
}
