const MANGADEX_BASE = "https://api.mangadex.org";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { id, "includes[]": includes } = req.query;
  if (Array.isArray(id)) id = id[0];
  if (!id || typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "Missing or invalid manga id" });
  }

  try {
    const url = new URL(`/manga/${id.trim()}`, MANGADEX_BASE);
    if (includes !== undefined) {
      const arr = Array.isArray(includes) ? includes : [includes];
      arr.forEach((v) => url.searchParams.append("includes[]", v));
    } else {
      url.searchParams.set("includes[]", "cover_art");
      url.searchParams.append("includes[]", "author");
      url.searchParams.append("includes[]", "artist");
    }

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
    console.error("Manga proxy error:", err);
    return res.status(500).json({ error: "Failed to load manga" });
  }
}
