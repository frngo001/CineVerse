import React, { useState, useEffect } from 'react';
import { tmdbApi, netflixFeatures } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import { useCountry } from '../contexts/CountryContext';

const NewAndPopular = () => {
  const { selectedCountry } = useCountry();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [mediaType, setMediaType] = useState('all');
  const [timeWindow, setTimeWindow] = useState('week');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [certificationCountry, setCertificationCountry] = useState('FR');
  const [certification, setCertification] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [releaseType, setReleaseType] = useState('');
  const [dateRange, setDateRange] = useState('30'); // Days

  const mediaTypeOptions = [
    { value: 'all', label: 'Tout' },
    { value: 'movie', label: 'Films uniquement' },
    { value: 'tv', label: 'Séries uniquement' }
  ];

  const timeWindowOptions = [
    { value: 'day', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' }
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Plus populaires' },
    { value: 'vote_average.desc', label: 'Mieux notés' },
    { value: 'release_date.desc', label: 'Plus récents' },
    { value: 'vote_count.desc', label: 'Plus de votes' }
  ];

  const releaseTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: '1', label: 'Première' },
    { value: '2', label: 'Sortie limitée' },
    { value: '3', label: 'Sortie cinéma' },
    { value: '4', label: 'Numérique' },
    { value: '5', label: 'Physique' },
    { value: '6', label: 'Télévision' },
    { value: '2|3', label: 'Cinéma (tous)' }
  ];

  const dateRangeOptions = [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: '30 derniers jours' },
    { value: '90', label: '3 derniers mois' },
    { value: '365', label: 'Année passée' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadContent();
  }, [currentPage, selectedGenres, mediaType, timeWindow, sortBy, selectedCountry, certification, releaseType, dateRange]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadContent();
    }
  }, [selectedGenres, mediaType, timeWindow, sortBy, selectedCountry, certification, releaseType, dateRange]);

  const loadInitialData = async () => {
    try {
      const [countriesData, movieGenresData, tvGenresData, movieCertsData] = await Promise.all([
        tmdbApi.getCountries(),
        tmdbApi.getMovieGenres(),
        tmdbApi.getTvGenres(),
        tmdbApi.getMovieCertifications()
      ]);

      setCountries(countriesData || []);
      
      // Combine movie and TV genres
      const allGenres = [
        ...(movieGenresData.genres || []),
        ...(tvGenresData.genres || [])
      ].filter((genre, index, self) => 
        index === self.findIndex(g => g.id === genre.id)
      );
      setGenres(allGenres);

      // Set certifications for France
      setCertifications(movieCertsData.certifications?.FR || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      let data;

      if (searchQuery.trim()) {
        data = await tmdbApi.searchMulti(searchQuery, currentPage);
      } else {
        // Build date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateRange));

        const params = {
          page: currentPage,
          sort_by: sortBy,
          'vote_count.gte': 10,
          region: selectedCountry || undefined
        };

        // Add genre filter
        if (selectedGenres.length > 0) {
          params.with_genres = selectedGenres.join(',');
        }

        // Add certification
        if (certification) {
          params.certification_country = certificationCountry;
          params.certification = certification;
        }

        // Add release type for movies
        if (releaseType && mediaType !== 'tv') {
          params.with_release_type = releaseType;
        }

        if (mediaType === 'all') {
          // Use trending with filters for mixed content
          data = await tmdbApi.getTrendingWithFilters({
            timeWindow,
            mediaType: 'all',
            region: selectedCountry,
            ...params
          });
        } else if (mediaType === 'movie') {
          // Use date range for movies
          params['release_date.gte'] = startDate.toISOString().split('T')[0];
          params['release_date.lte'] = endDate.toISOString().split('T')[0];
          data = await tmdbApi.discoverMovies(params);
        } else {
          // Use date range for TV
          params['first_air_date.gte'] = startDate.toISOString().split('T')[0];
          params['first_air_date.lte'] = endDate.toISOString().split('T')[0];
          data = await tmdbApi.discoverTv(params);
        }
      }

      setContent(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadContent();
  };

  const handleGenreChange = (genreIds) => {
    setSelectedGenres(genreIds);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Note: Region change is now handled globally via context

  const clearFilters = () => {
    setSelectedGenres([]);
    setMediaType('all');
    setTimeWindow('week');
    setSortBy('popularity.desc');
    setSearchQuery('');
    setCertification('');
    setReleaseType('');
    setDateRange('30');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedGenres.length > 0) count++;
    if (mediaType !== 'all') count++;
    if (timeWindow !== 'week') count++;
    if (sortBy !== 'popularity.desc') count++;
    if (certification) count++;
    if (releaseType) count++;
    if (dateRange !== '30') count++;
    if (searchQuery) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nouveautés les plus regardées
          </h1>
          <p className="text-gray-400">
            Découvrez les derniers contenus populaires et tendances
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les nouveautés..."
              className="flex-1 bg-[#2F2F2F] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="bg-[#2F2F2F] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            {/* Media Type */}
            <div>
              <label className="block text-white font-medium mb-2">Type de contenu</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                {mediaTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Window */}
            <div>
              <label className="block text-white font-medium mb-2">Période</label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                {timeWindowOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-white font-medium mb-2">Période de sortie</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white font-medium mb-2">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note: Country selection is now handled globally via the navbar */}

            {/* Release Type (for movies) */}
            {mediaType !== 'tv' && (
              <div>
                <label className="block text-white font-medium mb-2">Type de sortie</label>
                <select
                  value={releaseType}
                  onChange={(e) => setReleaseType(e.target.value)}
                  className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  {releaseTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Second row of filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Genres</label>
              <GenreFilter
                genres={genres}
                selectedGenres={selectedGenres}
                onGenreChange={handleGenreChange}
                isMultiSelect={true}
                placeholder="Tous les genres"
              />
            </div>

            {/* Certification */}
            {mediaType !== 'tv' && certifications.length > 0 && (
              <div>
                <label className="block text-white font-medium mb-2">Classification</label>
                <select
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Toutes classifications</option>
                  {certifications.map(cert => (
                    <option key={cert.certification} value={cert.certification}>
                      {cert.certification} - {cert.meaning}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Effacer les filtres
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map(genreId => {
                  const genre = genres.find(g => g.id === genreId);
                  return genre ? (
                    <span
                      key={genreId}
                      className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {genre.name}
                      <button
                        onClick={() => handleGenreChange(selectedGenres.filter(id => id !== genreId))}
                        className="hover:bg-red-700 rounded-full p-1"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                
                {mediaType !== 'all' && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {mediaTypeOptions.find(m => m.value === mediaType)?.label}
                    <button onClick={() => setMediaType('all')} className="hover:bg-blue-700 rounded-full p-1">×</button>
                  </span>
                )}

                {selectedCountry && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {countries.find(c => c.iso_3166_1 === selectedCountry)?.native_name || selectedCountry}
                    <button onClick={() => {
                      // Note: Country change is now handled globally via context
                    }} className="hover:bg-green-700 rounded-full p-1">×</button>
                  </span>
                )}

                {certification && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {certification}
                    <button onClick={() => setCertification('')} className="hover:bg-purple-700 rounded-full p-1">×</button>
                  </span>
                )}

                {searchQuery && (
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:bg-orange-700 rounded-full p-1">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Page {currentPage} sur {totalPages} ({content.length} résultats)
          </p>
          <div className="text-gray-400 text-sm">
            {selectedCountry && `Région: ${countries.find(c => c.iso_3166_1 === selectedCountry)?.native_name || selectedCountry}`}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-xl">Chargement des nouveautés...</div>
          </div>
        )}

        {/* Content Grid */}
        {!loading && content.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-8 px-4">
            {content.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type || 'movie'}`}
                movie={item}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && content.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white text-xl mb-4">Aucun contenu trouvé</div>
            <p className="text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche ou vos filtres
            </p>
            <button
              onClick={clearFilters}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && content.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#2F2F2F] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors duration-200"
            >
              Précédent
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-red-600 text-white'
                      : 'bg-[#2F2F2F] text-white hover:bg-[#404040]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#2F2F2F] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors duration-200"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAndPopular; 