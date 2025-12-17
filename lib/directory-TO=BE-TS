export type { DirectoryItem } from "@/app/api/directory/search/route";

export async function searchDirectory(params: {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) {
  // Call our own server route locally
  const url = new URL(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/directory/search`
  );
  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Directory bridge failed with ${res.status}`);
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Unknown error");
  return data as {
    ok: true;
    count: number;
    page: number;
    pageSize: number;
    items: import("@/app/api/directory/search/route").DirectoryItem[];
  };
}
