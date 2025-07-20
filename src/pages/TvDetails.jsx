import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaCalendarAlt, FaTv, FaStar, FaFilm } from 'react-icons/fa';
import { tmdbApi, getBackdropUrl, getImageUrl } from '../services/tmdb';
import TrailerModal from '../components/TrailerModal';
import StreamingModal from '../components/StreamingModal';
import CastList from '../components/CastList';
import ReviewList from '../components/ReviewList';

import SliderRow from '../components/SliderRow';

const TvDetails = () => {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedEpisodeObj, setSelectedEpisodeObj] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchTvDetails();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const fetchTvDetails = async () => {
    try {
      setLoading(true);
      const [
        tvResponse,
        creditsResponse,
        reviewsResponse,
        similarResponse,
        recommendationsResponse
      ] = await Promise.all([
        tmdbApi.getTvDetails(id),
        tmdbApi.getTvCredits(id),
        tmdbApi.getTvReviews(id),
        tmdbApi.getSimilarTv(id),
        tmdbApi.getTvRecommendations(id)
      ]);
      setTvShow(tvResponse);
      setCredits(creditsResponse);
      setReviews(reviewsResponse.results);
      setSimilar(similarResponse.results);
      setRecommendations(recommendationsResponse.results);
    } catch (error) {
      console.error('Error fetching TV show details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeSelect = (seasonNumber, episodeNumber, episodeObj) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(episodeNumber);
    setSelectedEpisodeObj(episodeObj);
    setShowStreaming(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatus = (status) => {
    const statusMap = {
      'Returning Series': 'En cours',
      'Ended': 'Terminée',
      'Canceled': 'Annulée',
      'In Production': 'En production',
      'Pilot': 'Pilote',
      'Planned': 'Planifiée'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-netflix-black">
        <div className="h-96 bg-netflix-gray animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-netflix-gray rounded animate-pulse" />
            <div className="h-4 bg-netflix-gray rounded animate-pulse w-3/4" />
            <div className="h-4 bg-netflix-gray rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="pt-16 min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Série introuvable</h1>
          <Link to="/" className="text-netflix-red hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-16 min-h-screen bg-netflix-black">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getBackdropUrl(tvShow.backdrop_path, 'original')})`,
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
          <div className="relative h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-8">
                {/* Poster */}
                <div className="flex-none mb-4 md:mb-0">
                  <img
                    src={getImageUrl(tvShow.poster_path, 'w342')}
                    alt={tvShow.name}
                    className="w-48 md:w-64 rounded-lg shadow-2xl"
                  />
                </div>
                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {tvShow.name}
                  </h1>
                  {tvShow.original_name !== tvShow.name && (
                    <p className="text-gray-300 text-lg mb-4">
                      Titre original: {tvShow.original_name}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {tvShow.vote_average > 0 && (
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400" />
                        <span className="text-white font-semibold">
                          {tvShow.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-300">{formatDate(tvShow.first_air_date)}</span>
                    <span className="text-gray-300">{getStatus(tvShow.status)}</span>

                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tvShow.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-netflix-red text-white text-sm rounded-full"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        // Standard: erste Staffel, erste Episode
                        const firstSeason = tvShow.seasons?.find(s => s.season_number > 0);
                        const seasonNum = firstSeason?.season_number || 1;
                        navigate(`/watch/tv/${id}?season=${seasonNum}&episode=1`);
                      }}
                      className="flex items-center justify-center space-x-3 bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-200 transition-all duration-200 shadow-lg"
                    >
                      <FaPlay />
                      <span>Regarder</span>
                    </button>
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center justify-center space-x-3 bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-50 transition-all duration-200"
                    >
                      <FaFilm />
                      <span>Trailer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player & Staffel/Episoden-Auswahl */}
        {tvShow.seasons && (
          <>
            {/* StreamingModal für Episode */}
            {showStreaming && (
              <StreamingModal
                tvId={id}
                season={selectedSeason}
                episode={selectedEpisode}
                isOpen={showStreaming}
                onClose={() => setShowStreaming(false)}
                title={tvShow.name}
                subtitle={selectedEpisodeObj ? `${selectedEpisodeObj.name}` : ''}
              />
            )}

          </>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview */}
          {tvShow.overview && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-gray-200 text-lg leading-relaxed">{tvShow.overview}</p>
            </div>
          )}

          {/* TV Show Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Détails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-netflix-gray p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarAlt className="text-netflix-red" />
                  <span className="text-white font-semibold">Première diffusion</span>
                </div>
                <p className="text-gray-300">{formatDate(tvShow.first_air_date)}</p>
              </div>
              {tvShow.last_air_date && (
                <div className="bg-netflix-gray p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCalendarAlt className="text-netflix-red" />
                    <span className="text-white font-semibold">Dernière diffusion</span>
                  </div>
                  <p className="text-gray-300">{formatDate(tvShow.last_air_date)}</p>
                </div>
              )}


            </div>
          </div>

          {/* Networks */}
          {tvShow.networks && tvShow.networks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Chaînes/Plateformes</h3>
              <div className="flex flex-wrap gap-4">
                {tvShow.networks.map((network) => (
                  <div key={network.id} className="bg-netflix-gray p-3 rounded-lg">
                    <span className="text-white">{network.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {credits && credits.cast && (
            <CastList cast={credits.cast} />
          )}

          {/* Reviews */}
          <ReviewList reviews={reviews} />

          {/* Similar TV Shows */}
          {similar.length > 0 && (
            <SliderRow
              title="Séries similaires"
              items={similar}
              type="tv"
            />
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <SliderRow
              title="Recommandations"
              items={recommendations}
              type="tv"
            />
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          tvId={id}
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </>
  );
};

export default TvDetails; 