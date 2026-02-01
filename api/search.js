const MANGADEX_BASE = "https://api.mangadex.org";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { title, limit } = req.query;
  if (Array.isArray(title)) title = title[0];
  if (Array.isArray(limit)) limit = limit[0];
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Missing or invalid title" });
  }

  try {
    const url = new URL("/manga", MANGADEX_BASE);
    url.searchParams.set("title", title.trim());
    if (limit) url.searchParams.set("limit", String(limit));

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
    console.error("Search proxy error:", err);
    return res.status(500).json({ error: "Failed to search manga" });
  }
}
