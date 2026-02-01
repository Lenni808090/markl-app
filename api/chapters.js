const MANGADEX_BASE = "https://api.mangadex.org";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { mangaId, limit, offset, "order[chapter]": orderChapter, "translatedLanguage[]": lang } = req.query;
  if (Array.isArray(mangaId)) mangaId = mangaId[0];
  if (!mangaId || typeof mangaId !== "string" || !mangaId.trim()) {
    return res.status(400).json({ error: "Missing or invalid manga id" });
  }

  try {
    const url = new URL(`/manga/${mangaId.trim()}/feed`, MANGADEX_BASE);
    if (limit) url.searchParams.set("limit", Array.isArray(limit) ? limit[0] : limit);
    if (offset) url.searchParams.set("offset", Array.isArray(offset) ? offset[0] : offset);
    url.searchParams.set("order[chapter]", orderChapter === "asc" ? "asc" : "desc");
    url.searchParams.append("translatedLanguage[]", Array.isArray(lang) ? (lang[0] || "en") : (lang || "en"));

    const apiRes = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Mangadex API error" });
    }

    const data = await apiRes.json();
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Chapters proxy error:", err);
    return res.status(500).json({ error: "Failed to load chapters" });
  }
}
