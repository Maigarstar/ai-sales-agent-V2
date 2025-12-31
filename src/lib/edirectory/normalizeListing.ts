export function normalizeEDirectoryListing(
  item: any,
  BASE_URL: string
) {
  if (!item) return null;

  // --- Image resolution (API + Scrape safe) ---
  const image =
    item?.image?.url ||
    item?.thumbnail?.url ||
    item?.coverImage?.url ||
    item?.cover_image ||
    item?.image ||
    null;

  // --- Description cleanup ---
  const clean = (text?: string) =>
    text
      ? text.replace(/<[^>]*>/g, "").trim().slice(0, 160)
      : "";

  const url =
    item?.url ||
    (item?.friendly_url
      ? `${BASE_URL}/${item.friendly_url}`
      : item?.id
      ? `${BASE_URL}/listing/${item.id}`
      : null);

  if (!url) return null;

  return {
    id: item.id || url, // 🔑 stable ID for shortlist
    title: item.title || item.name || "Featured Venue",
    location:
      item.location ||
      item.city ||
      item.address?.city ||
      "United Kingdom",
    image,
    description:
      item.description ||
      item.summary ||
      clean(item.short_description),
    url,
  };
}
