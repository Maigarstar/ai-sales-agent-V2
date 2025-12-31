export async function getEdirectoryHighlights(context: {
  location?: string;
  category?: string;
}) {
  const base = process.env.EDIRECTORY_API_BASE;

  if (!base) {
    console.warn("EDIRECTORY_API_BASE not set, skipping highlights");
    return [];
  }

  let url: URL;

  try {
    url = new URL("/api/v4/listing/search", base);
  } catch (err) {
    console.error("Invalid EDIRECTORY_API_BASE:", base);
    return [];
  }

  if (context.location) url.searchParams.set("location", context.location);
  if (context.category) url.searchParams.set("q", context.category);

  url.searchParams.set("page_size", "3");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-API-KEY": process.env.EDIRECTORY_API_KEY ?? "",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("eDirectory API returned", res.status);
      return [];
    }

    const data = await res.json();

    return (data.results || []).filter(
      (item: any) => item.image || item.cover_image
    );
  } catch (err) {
    console.error("eDirectory fetch failed:", err);
    return [];
  }
}
