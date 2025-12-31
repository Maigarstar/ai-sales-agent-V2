import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();

    const API_BASE = "https://5starweddingdirectory.com";
    const API_KEY = process.env.DIRECTORY_API_KEY;

    if (!query) {
      return NextResponse.json({ ok: true, listings: [] });
    }

    const headers = {
      "X-API-KEY": API_KEY || "",
      Accept: "application/json",
    };

    /* ======================================================
       1️⃣ API SEARCH (KEYWORD + LOCATION)
       ====================================================== */

    let rawListings: any[] = [];

    if (API_KEY) {
      const keywordUrl = `${API_BASE}/api/v4/listings/search?keyword=${encodeURIComponent(query)}`;
      const locationUrl = `${API_BASE}/api/v4/listings/search?location=${encodeURIComponent(query)}`;

      const [keywordRes, locationRes] = await Promise.all([
        fetch(keywordUrl, { headers, cache: "no-store" }),
        fetch(locationUrl, { headers, cache: "no-store" }),
      ]);

      const keywordJson = keywordRes.ok ? await keywordRes.json() : null;
      const locationJson = locationRes.ok ? await locationRes.json() : null;

      const apiResults = [
        ...(Array.isArray(keywordJson?.data) ? keywordJson.data : []),
        ...(Array.isArray(locationJson?.data) ? locationJson.data : []),
      ];

      const map = new Map<string, any>();
      apiResults.forEach((item) => {
        if (item?.id) map.set(item.id.toString(), item);
      });

      rawListings = Array.from(map.values());
    }

    /* ======================================================
       2️⃣ FALLBACK: PUBLIC eDIRECTORY SEARCH (/k:QUERY)
       ====================================================== */

    if (rawListings.length === 0) {
      const publicSearchUrl = `${API_BASE}/k:${encodeURIComponent(query)}`;

      const html = await fetch(publicSearchUrl, { cache: "no-store" }).then((r) =>
        r.text()
      );

      const $ = cheerio.load(html);

      $(".results-item, .summary-item, .listing-item, article").each((i, el) => {
        if (i >= 24) return false;

        const block = $(el);
        const link = block.find("a[href*='/listing/']").first();
        const href = link.attr("href");
        if (!href) return;

        const title =
          block.find("h3, h4, .item-title, .title").text().trim() ||
          link.text().trim();

        let img =
          block.find("img").attr("data-src") ||
          block.find("img").attr("data-lazy-src") ||
          block.find("img").attr("src") ||
          null;

        if (img && (img.includes("spacer") || img.includes("placeholder"))) {
          img = null;
        }

        if (!img) {
          const style = block
            .find(".item-image, .image-background")
            .attr("style");
          const match = style?.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match) img = match[1];
        }

        rawListings.push({
          id: href,
          title,
          image: img
            ? img.startsWith("http")
              ? img
              : `${API_BASE}${img}`
            : null,
          location: query,
          friendly_url: href,
          description: block.find("p").text().trim(),
        });
      });
    }

    /* ======================================================
       3️⃣ NORMALISE FOR AURA
       ====================================================== */

    const listings = rawListings.map((item: any) => {
      const imagePath =
        item.image?.url ||
        item.main_image?.url ||
        item.images?.main?.url ||
        item.image ||
        null;

      return {
        id: item.id?.toString(),
        title: item.title || "Exclusive Partner",
        location:
          item.location_name ||
          item.address?.city ||
          item.location ||
          "London & Global",
        image: imagePath
          ? imagePath.startsWith("http")
            ? imagePath
            : `${API_BASE}${imagePath}`
          : null,
        url: item.friendly_url
          ? item.friendly_url.startsWith("http")
            ? item.friendly_url
            : `${API_BASE}${item.friendly_url}`
          : `${API_BASE}`,
        short_description:
          item.description
            ?.replace(/<[^>]*>/g, "")
            .slice(0, 150) || "",
      };
    });

    return NextResponse.json({
      ok: true,
      count: listings.length,
      listings,
      source: rawListings.length ? "api+public" : "none",
    });
  } catch (err: any) {
    console.error("Directory Search Error:", err.message);
    return NextResponse.json({ ok: true, listings: [] });
  }
}
