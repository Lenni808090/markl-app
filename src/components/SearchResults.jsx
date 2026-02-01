import { Link } from 'react-router-dom';

const SearchResults = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-400">Searching...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">
        Search Results ({results.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((manga) => (
          <Link
            key={manga.id}
            to={`/manga/${manga.id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {manga.title}
              </h3>
              <p className="text-sm text-gray-400">ID: {manga.id}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
