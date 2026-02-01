const MANGADEX_BASE = "https://api.mangadex.org";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { chapterId } = req.query;
  if (Array.isArray(chapterId)) chapterId = chapterId[0];
  if (!chapterId || typeof chapterId !== "string" || !chapterId.trim()) {
    return res.status(400).json({ error: "Missing or invalid chapter id" });
  }

  try {
    const url = new URL(`/at-home/server/${chapterId.trim()}`, MANGADEX_BASE);

    const apiRes = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Mangadex API error" });
    }

    const data = await apiRes.json();
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Chapter proxy error:", err);
    return res.status(500).json({ error: "Failed to load chapter" });
  }
}
