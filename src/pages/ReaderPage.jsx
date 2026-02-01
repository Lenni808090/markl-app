import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/chapter', {
          params: { chapterId },
        });

        const { baseUrl, chapter } = response.data;
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
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chapter');
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

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
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-black/90 border-b border-gray-800">
        <Link to="/" className="text-gray-400 hover:text-white text-sm">← Back</Link>
        <span className="text-gray-500 text-sm">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-4 gap-2 overflow-y-auto">
        {pages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Page ${i + 1}`}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
