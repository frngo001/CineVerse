import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { tmdbApi } from '../services/tmdb';

const TrailerModal = ({ movieId, tvId, isOpen, onClose }) => {
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && (movieId || tvId)) {
      fetchTrailer();
    }
  }, [isOpen, movieId, tvId]);

  const fetchTrailer = async () => {
    try {
      setLoading(true);
      let response;
      
      if (movieId) {
        response = await tmdbApi.getMovieVideos(movieId);
      } else if (tvId) {
        response = await tmdbApi.getTvVideos(tvId);
      }
      
      const videos = response.results;
      
      // Find trailer (prefer official trailers)
      const trailerVideo = videos.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.find(
        video => video.site === 'YouTube'
      );
      
      setTrailer(trailerVideo);
    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl bg-netflix-black rounded-lg overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200"
          aria-label="Fermer"
        >
          <FaTimes size={20} />
        </button>

        {/* Content */}
        <div className="aspect-video">
          {loading ? (
            <div className="w-full h-full bg-netflix-gray animate-pulse flex items-center justify-center">
              <div className="text-white">Chargement de la bande-annonce...</div>
            </div>
          ) : trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-netflix-gray flex items-center justify-center">
              <div className="text-white text-center">
                <p className="mb-2">Aucune bande-annonce disponible</p>
                <p className="text-sm text-gray-400">
                  Désolé, aucune bande-annonce n'a été trouvée pour ce contenu.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal; 