import * as cheerio from "cheerio";

const BASE_URL = "https://5starweddingdirectory.com";

export interface RawDirectoryListing {
  title: string;
  url: string;
  image: string | null;
  location: string;
  description: string;
}

export async function searchDirectory(
  query: string,
  limit = 6
): Promise<RawDirectoryListing[]> {
  const url = `${BASE_URL}/k:${encodeURIComponent(query)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Directory fetch failed (${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const results: RawDirectoryListing[] = [];
  const seen = new Set<string>();

  $("a[href*='/listing/']").each((_, el) => {
    if (results.length >= limit) return false;

    const link = $(el);
    const href = link.attr("href");
    if (!href || !href.endsWith(".html")) return;

    const absoluteUrl = new URL(href, BASE_URL).href;
    if (seen.has(absoluteUrl)) return;
    seen.add(absoluteUrl);

    const block = link.closest(
      "article, .results-item, .summary-item, .item, .listing-item, div"
    );

    const title =
      block.find("h3, h4, .item-title, .title").first().text().trim() ||
      link.text().trim();

    if (!title) return;

    let image =
      block.find("img").attr("data-src") ||
      block.find("img").attr("data-lazy-src") ||
      block.find("img").attr("src") ||
      null;

    if (
      image &&
      (image.includes("placeholder") ||
        image.includes("spacer") ||
        image.startsWith("data:"))
    ) {
      image = null;
    }

    if (!image) {
      const style =
        block.find(".item-image, .image-background").attr("style") ||
        block.attr("style");
      const match = style?.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) image = match[1];
    }

    results.push({
      title,
      url: absoluteUrl,
      image: image
        ? image.startsWith("http")
          ? image
          : new URL(image, BASE_URL).href
        : null,
      location:
        block.find(".item-location, .location").first().text().trim() || "",
      description:
        block
          .find(".summary-description, .item-description, p")
          .first()
          .text()
          .trim()
          .slice(0, 160),
    });
  });

  return results;
}
