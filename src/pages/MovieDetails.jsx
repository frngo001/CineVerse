import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaCalendarAlt, FaClock, FaDollarSign, FaStar, FaFilm } from 'react-icons/fa';
import { tmdbApi, getBackdropUrl, getImageUrl } from '../services/tmdb';
import TrailerModal from '../components/TrailerModal';
import StreamingModal from '../components/StreamingModal';
import CastList from '../components/CastList';
import ReviewList from '../components/ReviewList';
import SliderRow from '../components/SliderRow';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [releaseDates, setReleaseDates] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      
      const [
        movieResponse,
        creditsResponse,
        reviewsResponse,
        similarResponse,
        recommendationsResponse,
        releaseDatesResponse
      ] = await Promise.all([
        tmdbApi.getMovieDetails(id),
        tmdbApi.getMovieCredits(id),
        tmdbApi.getMovieReviews(id),
        tmdbApi.getSimilarMovies(id),
        tmdbApi.getMovieRecommendations(id),
        tmdbApi.getReleaseDates(id)
      ]);

      setMovie(movieResponse);
      setCredits(creditsResponse);
      setReviews(reviewsResponse.results);
      setSimilar(similarResponse.results);
      setRecommendations(recommendationsResponse.results);
      setReleaseDates(releaseDatesResponse.results);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Durée inconnue';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Non disponible';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertification = () => {
    const frRelease = releaseDates.find(release => release.iso_3166_1 === 'FR');
    if (frRelease && frRelease.release_dates.length > 0) {
      const certification = frRelease.release_dates[0].certification;
      return certification || 'Non classé';
    }
    return 'Non classé';
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

  if (!movie) {
    return (
      <div className="pt-16 min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Film introuvable</h1>
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
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'original')})`,
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
                    src={getImageUrl(movie.poster_path, 'w342')}
                    alt={movie.title}
                    className="w-48 md:w-64 rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {movie.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400" />
                        <span className="text-white font-semibold">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-300">{formatDate(movie.release_date)}</span>
                    <span className="text-gray-300">{formatRuntime(movie.runtime)}</span>
                    <span className="px-2 py-1 bg-gray-600 text-white text-sm rounded">
                      {getCertification()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map((genre) => (
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
                      onClick={() => navigate(`/watch/movie/${id}`)}
                      className="flex items-center justify-center space-x-3 bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-200 transition-all duration-200 shadow-lg"
                    >
                      <FaPlay />
                      <span>Abspielen</span>
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

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview */}
          {movie.overview && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-gray-200 text-lg leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {/* Movie Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Détails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-netflix-gray p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendarAlt className="text-netflix-red" />
                  <span className="text-white font-semibold">Date de sortie</span>
                </div>
                <p className="text-gray-300">{formatDate(movie.release_date)}</p>
              </div>
              
              <div className="bg-netflix-gray p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaClock className="text-netflix-red" />
                  <span className="text-white font-semibold">Durée</span>
                </div>
                <p className="text-gray-300">{formatRuntime(movie.runtime)}</p>
              </div>
              
              {movie.budget > 0 && (
                <div className="bg-netflix-gray p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaDollarSign className="text-netflix-red" />
                    <span className="text-white font-semibold">Budget</span>
                  </div>
                  <p className="text-gray-300">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              
              {movie.revenue > 0 && (
                <div className="bg-netflix-gray p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaDollarSign className="text-netflix-red" />
                    <span className="text-white font-semibold">Recettes</span>
                  </div>
                  <p className="text-gray-300">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cast */}
          {credits && credits.cast && (
            <CastList cast={credits.cast} />
          )}

          {/* Reviews */}
          <ReviewList reviews={reviews} />

          {/* Similar Movies */}
          {similar.length > 0 && (
            <SliderRow
              title="Films similaires"
              items={similar}
              type="movie"
            />
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <SliderRow
              title="Recommandations"
              items={recommendations}
              type="movie"
            />
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          movieId={id}
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
        />
      )}

      {/* Streaming Modal */}
      {showStreaming && (
        <StreamingModal
          movieId={id}
          isOpen={showStreaming}
          onClose={() => setShowStreaming(false)}
        />
      )}
    </>
  );
};

export default MovieDetails; 