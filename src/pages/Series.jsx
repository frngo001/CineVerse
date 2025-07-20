import React, { useState, useEffect } from 'react';
import { tmdbApi } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import LanguageFilter from '../components/LanguageFilter';
import { useCountry } from '../contexts/CountryContext';

const Series = () => {
  const { selectedCountry } = useCountry();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [languages, setLanguages] = useState([]);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Plus populaires' },
    { value: 'vote_average.desc', label: 'Mieux notées' },
    { value: 'first_air_date.desc', label: 'Plus récentes' },
    { value: 'name.asc', label: 'Titre A-Z' },
    { value: 'vote_count.desc', label: 'Plus de votes' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: '0', label: 'Retour planifié' },
    { value: '1', label: 'En production' },
    { value: '2', label: 'Diffusion en cours' },
    { value: '3', label: 'Terminée' },
    { value: '4', label: 'Annulée' },
    { value: '5', label: 'Pilote' }
  ];

  useEffect(() => {
    loadGenres();
    loadLanguages();
  }, []);

  useEffect(() => {
    loadSeries();
  }, [currentPage, selectedGenres, sortBy, yearFilter, statusFilter, selectedLanguage, selectedCountry]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadSeries();
    }
  }, [selectedGenres, sortBy, yearFilter, statusFilter, selectedLanguage, selectedCountry]);

  const loadGenres = async () => {
    try {
      const data = await tmdbApi.getTvGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const loadLanguages = async () => {
    try {
      const data = await tmdbApi.getLanguages();
      setLanguages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des langues:', error);
    }
  };

  const loadSeries = async () => {
    try {
      setLoading(true);
      let data;

      if (searchQuery.trim()) {
        data = await tmdbApi.searchTv(searchQuery, currentPage);
      } else {
        const params = {
          page: currentPage,
          sort_by: sortBy,
          with_genres: selectedGenres.join(','),
          'vote_count.gte': 10, // Minimum vote count for quality
          region: selectedCountry || undefined
        };

        if (yearFilter) {
          params.first_air_date_year = yearFilter;
        }

        if (statusFilter) {
          params.with_status = statusFilter;
        }

        if (selectedLanguage) {
          params.with_original_language = selectedLanguage;
        }

        data = await tmdbApi.discoverTv(params);
      }

      setSeries(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500)); // Limit to 500 pages
    } catch (error) {
      console.error('Erreur lors du chargement des séries:', error);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSeries();
  };

  const handleGenreChange = (genreIds) => {
    setSelectedGenres(genreIds);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleYearChange = (year) => {
    setYearFilter(year);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSortBy('popularity.desc');
    setYearFilter('');
    setStatusFilter('');
    setSelectedLanguage('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Séries TV
          </h1>
          <p className="text-gray-400">
            Découvrez notre collection complète de séries télévisées
          </p>
          
          {/* Quick Category Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setSortBy('popularity.desc');
                setSelectedGenres([]);
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                sortBy === 'popularity.desc' && selectedGenres.length === 0 && !yearFilter && !statusFilter
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Populaires
            </button>
            <button
              onClick={() => {
                setSortBy('first_air_date.desc');
                setSelectedGenres([]);
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                sortBy === 'first_air_date.desc' && selectedGenres.length === 0 && !yearFilter && !statusFilter
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Plus récentes
            </button>
            <button
              onClick={() => {
                setSortBy('vote_average.desc');
                setSelectedGenres([]);
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                sortBy === 'vote_average.desc' && selectedGenres.length === 0 && !yearFilter && !statusFilter
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Mieux notées
            </button>
            <button
              onClick={() => {
                setSortBy('popularity.desc');
                setSelectedGenres([]);
                setYearFilter('');
                setStatusFilter('2'); // Currently airing
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                statusFilter === '2'
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              En cours
            </button>
            <button
              onClick={() => {
                setSortBy('popularity.desc');
                setSelectedGenres([18]); // Drama genre
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                selectedGenres.includes(18)
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Drame
            </button>
            <button
              onClick={() => {
                setSortBy('popularity.desc');
                setSelectedGenres([35]); // Comedy genre
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                selectedGenres.includes(35)
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Comédie
            </button>
            <button
              onClick={() => {
                setSortBy('popularity.desc');
                setSelectedGenres([9648]); // Mystery genre
                setYearFilter('');
                setStatusFilter('');
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                selectedGenres.includes(9648)
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Mystère
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des séries..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Genres</label>
              <GenreFilter
                genres={genres}
                selectedGenres={selectedGenres}
                onGenreChange={handleGenreChange}
                isMultiSelect={true}
              />
            </div>

            {/* Sort Filter */}
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

            {/* Year Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Année</label>
              <select
                value={yearFilter}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                <option value="">Toutes les années</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-white font-medium mb-2">Langue d'origine</label>
              <LanguageFilter
                languages={languages}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Effacer les filtres
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedGenres.length > 0 || yearFilter || statusFilter || selectedLanguage || searchQuery) && (
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
                {yearFilter && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {yearFilter}
                    <button
                      onClick={() => handleYearChange('')}
                      className="hover:bg-blue-700 rounded-full p-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {statusOptions.find(s => s.value === statusFilter)?.label}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="hover:bg-purple-700 rounded-full p-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedLanguage && (
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {languages.find(l => l.iso_639_1 === selectedLanguage)?.english_name || selectedLanguage}
                    <button
                      onClick={() => handleLanguageChange('')}
                      className="hover:bg-orange-700 rounded-full p-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                        loadSeries();
                      }}
                      className="hover:bg-green-700 rounded-full p-1"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Page {currentPage} sur {totalPages} ({series.length} séries)
          </p>
          <div className="text-gray-400 text-sm">
            {sortBy === 'popularity.desc' && 'Triées par popularité'}
            {sortBy === 'vote_average.desc' && 'Triées par note'}
            {sortBy === 'first_air_date.desc' && 'Triées par date de première diffusion'}
            {sortBy === 'name.asc' && 'Triées par titre'}
            {sortBy === 'vote_count.desc' && 'Triées par nombre de votes'}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-xl">Chargement des séries...</div>
          </div>
        )}

        {/* Series Grid */}
        {!loading && series.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-8 px-4">
            {series.map((show) => (
              <MovieCard
                key={show.id}
                movie={show}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && series.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white text-xl mb-4">Aucune série trouvée</div>
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
        {!loading && series.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#2F2F2F] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors duration-200"
            >
              Précédent
            </button>

            {/* Page numbers */}
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

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#2F2F2F] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors duration-200"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Jump to page */}
        {totalPages > 10 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <span className="text-gray-400">Aller à la page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-20 bg-[#2F2F2F] text-white px-2 py-1 rounded border border-gray-600 focus:border-red-500 focus:outline-none text-center"
            />
            <span className="text-gray-400">/ {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series; 