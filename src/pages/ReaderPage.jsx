import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [pages, setPages] = useState([]);
  const [mangaId, setMangaId] = useState(null);
  const [mangaTitle, setMangaTitle] = useState(null);
  const [chapterLabel, setChapterLabel] = useState(null);
  const [prevChapterId, setPrevChapterId] = useState(null);
  const [nextChapterId, setNextChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        setNextChapterId(null);
        setPrevChapterId(null);
        const response = await axios.get('/api/chapter', {
          params: { chapterId },
        });

        const { baseUrl, chapter, mangaId: mid, mangaTitle: mTitle, chapterNumber: chNum, chapterTitle: chTitle } = response.data;
        const hash = chapter?.hash;
        const filenames = chapter?.data ?? chapter?.dataSaver ?? [];
        const quality = chapter?.data ? 'data' : 'data-saver';

        if (!baseUrl || !hash || !filenames.length) {
          setError('No page data for this chapter');
          setPages([]);
          return;
        }

        const urls = filenames.map((filename) => {
          const fullUrl = `${baseUrl}/${quality}/${hash}/${filename}`;
          return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
        });

        setPages(urls);
        setMangaId(mid || null);
        setMangaTitle(mTitle || null);
        const label = chNum != null && chNum !== ''
          ? (chTitle ? `Ch. ${chNum} – ${chTitle}` : `Ch. ${chNum}`)
          : (chTitle || null);
        setChapterLabel(label);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chapter');
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  useEffect(() => {
    if (!mangaId || !chapterId) return;

    const fetchAdjacent = async () => {
      try {
        const response = await axios.get('/api/chapters', {
          params: {
            mangaId,
            limit: 500,
            'order[chapter]': 'asc',
            'translatedLanguage[]': 'en',
          },
        });
        const list = response.data.data || [];
        const idx = list.findIndex((ch) => ch.id === chapterId);
        if (idx !== -1) {
          if (idx > 0) setPrevChapterId(list[idx - 1].id);
          if (idx < list.length - 1) setNextChapterId(list[idx + 1].id);
        }
      } catch {
        // ignore
      }
    };

    fetchAdjacent();
  }, [mangaId, chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p className="text-xl opacity-80">Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-xl text-red-400">{error}</p>
        <Link to="/" className="text-blue-400 hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-2 bg-black/90 border-b border-gray-800 min-h-12">
        <Link to="/" className="text-gray-400 hover:text-white text-sm shrink-0">← Back</Link>
        <div className="flex flex-col items-center min-w-0 flex-1 text-center">
          {mangaTitle && (
            <Link
              to={mangaId ? `/manga/${mangaId}` : '/'}
              className="text-white font-medium truncate max-w-full hover:text-blue-400 transition-colors"
              title={mangaTitle}
            >
              {mangaTitle}
            </Link>
          )}
          {chapterLabel && (
            <span className="text-gray-400 text-sm truncate max-w-full" title={chapterLabel}>
              {chapterLabel}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm shrink-0">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-4 gap-2">
        {pages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Page ${i + 1}`}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        ))}

        {(prevChapterId || nextChapterId) && (
          <div className="flex flex-wrap items-center justify-center gap-4 py-8">
            {prevChapterId && (
              <Link
                to={`/reader/${prevChapterId}`}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                ← Previous chapter
              </Link>
            )}
            {nextChapterId && (
              <Link
                to={`/reader/${nextChapterId}`}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Next chapter →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
