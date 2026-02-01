import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SearchResults from "../components/SearchResults.jsx";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSearchParams({ q: newQuery });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const baseUrl = "https://api.mangadex.org";

        const resp = await axios({
          method: "GET",
          url: `${baseUrl}/manga`,
          params: {
            title: query,
            limit: 20,
          },
        });

        const mangaResults = resp.data.data.map((manga) => ({
          id: manga.id,
          title: manga.attributes.title.en || 
                manga.attributes.title["ja-ro"] || 
                manga.attributes.title.ja ||
                Object.values(manga.attributes.title)[0] ||
                "No Title",
        }));

        setResults(mangaResults);
      } catch (error) {
        console.error("Error fetching manga:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
      <h1 className="text-5xl font-bold mb-8">Manga Reader</h1>
      <p className="text-xl mb-6">Search a Manga</p>
      <input
        type="text"
        placeholder="Search for a manga..."
        className="p-4 rounded bg-gray-800 text-white w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={query}
        onChange={handleChange}
      />
      <SearchResults results={results} loading={loading} />
    </div>
  );
};

export default HomePage;
