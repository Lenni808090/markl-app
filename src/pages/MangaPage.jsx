import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function MangaPage() {
  const { mangaId } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mangaId) return;

    const fetchManga = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/manga', {
          params: {
            id: mangaId,
            'includes[]': ['cover_art', 'author', 'artist'],
          },
        });

        setManga(response.data.data);
      } catch (err) {
        setError(err.response?.data?.errors?.[0]?.detail || 'Failed to load manga');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [mangaId]);

  useEffect(() => {
    if (!mangaId) return;

    const fetchChapters = async () => {
      try {
        setChaptersLoading(true);
        const response = await axios.get('/api/chapters', {
          params: {
            mangaId,
            limit: 500,
            'order[chapter]': 'asc',
            'translatedLanguage[]': 'en',
          },
        });
        setChapters(response.data.data || []);
      } catch (err) {
        console.error('Failed to load chapters:', err);
        setChapters([]);
      } finally {
        setChaptersLoading(false);
      }
    };

    fetchChapters();
  }, [mangaId]);

  if (loading) return <div className="text-center p-10">Loading manga...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!manga) return <div className="p-10">Manga not found</div>;

  // Helper to get best title (English > romanized JP > any)
  const titleObj = manga.attributes.title || {};
  const displayTitle =
    titleObj.en ||
    titleObj['ja-ro'] ||
    titleObj.ja ||
    Object.values(titleObj)[0] ||
    'No title';

  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  const coverFilename = coverRel?.attributes?.fileName;
  const coverUrl = coverFilename
    ? `/api/proxy-image?url=${encodeURIComponent(`https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`)}`
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={displayTitle}
              className="w-64 h-auto object-cover rounded-lg shadow-lg"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
            <p className="text-gray-400 mb-2">
              {manga.attributes.year && `${manga.attributes.year} • `}
              {manga.attributes.status}
            </p>
            <p className="mb-6">{manga.attributes.description?.en || 'No description available'}</p>

            {/* Tags, authors, etc. */}
            <div className="flex flex-wrap gap-2 mb-6">
              {manga.attributes.tags?.map(tag => (
                <span
                  key={tag.id}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter list */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Chapters</h2>
          {chaptersLoading ? (
            <p className="text-gray-400">Loading chapters...</p>
          ) : chapters.length === 0 ? (
            <p className="text-gray-400">No chapters available</p>
          ) : (
            <ul className="space-y-1 max-h-96 overflow-y-auto rounded-lg bg-gray-800/50 p-2">
              {chapters.map((ch) => {
                const chNum = ch.attributes?.chapter;
                const title = ch.attributes?.title?.trim();
                const label = chNum != null
                  ? (title ? `Ch. ${chNum} – ${title}` : `Ch. ${chNum}`)
                  : (title || ch.id);
                return (
                  <li key={ch.id}>
                    <Link
                      to={`/reader/${ch.id}`}
                      className="block py-2 px-3 rounded hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}