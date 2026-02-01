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

  const id = chapterId.trim();

  try {
    const [atHomeRes, chapterRes] = await Promise.all([
      fetch(new URL(`/at-home/server/${id}`, MANGADEX_BASE).toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      }),
      fetch(new URL(`/chapter/${id}`, MANGADEX_BASE).toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    ]);

    if (!atHomeRes.ok) {
      return res.status(atHomeRes.status).json({ error: "Mangadex API error" });
    }

    const data = await atHomeRes.json();

    if (chapterRes.ok) {
      const chapterData = await chapterRes.json();
      const mangaRel = chapterData.data?.relationships?.find((r) => r.type === "manga");
      if (mangaRel?.id) data.mangaId = mangaRel.id;
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Chapter proxy error:", err);
    return res.status(500).json({ error: "Failed to load chapter" });
  }
}
