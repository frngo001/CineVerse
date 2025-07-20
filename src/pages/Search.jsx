import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { searchApi } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import PersonCard from '../components/PersonCard';
import GenreFilter from '../components/GenreFilter';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setResults([]);
      setTotalPages(0);
    }
  }, [query, activeTab, page]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 'movies':
          response = await searchApi.searchMovies(query, page);
          break;
        case 'tv':
          response = await searchApi.searchTv(query, page);
          break;
        case 'people':
          response = await searchApi.searchPeople(query, page);
          break;
        default:
          response = await searchApi.searchMulti(query, page);
      }
      
      if (page === 1) {
        setResults(response.data.results);
      } else {
        setResults(prev => [...prev, ...response.data.results]);
      }
      
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setPage(1);
      setResults([]);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
    setResults([]);
  };

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const filteredResults = results.filter(item => {
    // Apply genre filter only for movies and TV shows
    if (selectedGenres.length > 0 && (item.media_type === 'movie' || item.media_type === 'tv' || activeTab === 'movies' || activeTab === 'tv')) {
      return item.genre_ids && item.genre_ids.some(genreId => selectedGenres.includes(genreId));
    }
    return true;
  });

  const getTabCount = (type) => {
    if (type === 'all') return results.length;
    return results.filter(item => item.media_type === type || (type === 'movies' && !item.media_type)).length;
  };

  return (
    <div className="pt-16 min-h-screen bg-netflix-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Rechercher des films, séries et personnalités
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tapez votre recherche..."
                className="w-full bg-netflix-gray text-white px-6 py-4 pr-12 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaSearch size={20} />
              </button>
            </div>
          </form>

          {/* Filters and Tabs */}
          {query.trim() && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeTab === 'all'
                      ? 'bg-netflix-red text-white'
                      : 'bg-netflix-gray text-gray-300 hover:text-white'
                  }`}
                >
                  Tout ({results.length})
                </button>
                <button
                  onClick={() => handleTabChange('movies')}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeTab === 'movies'
                      ? 'bg-netflix-red text-white'
                      : 'bg-netflix-gray text-gray-300 hover:text-white'
                  }`}
                >
                  Films ({getTabCount('movie')})
                </button>
                <button
                  onClick={() => handleTabChange('tv')}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeTab === 'tv'
                      ? 'bg-netflix-red text-white'
                      : 'bg-netflix-gray text-gray-300 hover:text-white'
                  }`}
                >
                  Séries ({getTabCount('tv')})
                </button>
                <button
                  onClick={() => handleTabChange('people')}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    activeTab === 'people'
                      ? 'bg-netflix-red text-white'
                      : 'bg-netflix-gray text-gray-300 hover:text-white'
                  }`}
                >
                  Personnes ({getTabCount('person')})
                </button>
              </div>

              {/* Genre Filter - Only show for movies and TV */}
              {(activeTab === 'movies' || activeTab === 'tv' || activeTab === 'all') && (
                <GenreFilter
                  selectedGenres={selectedGenres}
                  onGenreChange={setSelectedGenres}
                  mediaType={activeTab === 'tv' ? 'tv' : 'movie'}
                />
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white text-lg">Recherche en cours...</div>
          </div>
        ) : filteredResults.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {filteredResults.map((item) => {
                const mediaType = item.media_type || (activeTab === 'tv' ? 'tv' : activeTab === 'movies' ? 'movie' : 'movie');
                
                if (mediaType === 'person') {
                  return <PersonCard key={`${item.id}-${item.media_type}`} person={item} />;
                } else {
                  return <MovieCard key={`${item.id}-${mediaType}`} movie={item} type={mediaType} />;
                }
              })}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-netflix-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}
          </>
        ) : query.trim() && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Aucun résultat trouvé pour "{query}"
            </div>
            <p className="text-gray-500">
              Essayez avec des mots-clés différents ou vérifiez l'orthographe.
            </p>
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Commencez à taper pour rechercher des films, séries et personnalités
            </div>
            <p className="text-gray-500">
              Utilisez la barre de recherche ci-dessus pour découvrir du contenu.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search; 