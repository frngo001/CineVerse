import React, { useState, useEffect } from 'react';
import { FaStar, FaCalendarAlt, FaClock, FaPlay, FaPlus, FaThumbsUp, FaThumbsDown, FaShare } from 'react-icons/fa';
import { tmdbApi, getImageUrl, netflixFeatures } from '../services/tmdb';
import { Link } from 'react-router-dom';

const WatchPageInfo = ({ videoData, episodeObj, selectedSeason, selectedEpisode, type }) => {
  const [cast, setCast] = useState([]);
  const [isInMyList, setIsInMyList] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    if (videoData) {
      // Lade Cast-Informationen
      const loadCast = async () => {
        try {
          const creditsData = type === 'tv' 
            ? await tmdbApi.getTvCredits(videoData.id)
            : await tmdbApi.getMovieCredits(videoData.id);
          setCast(creditsData.cast.slice(0, 6)); // Nur die ersten 6 Cast-Mitglieder
        } catch (error) {
          console.error('Fehler beim Laden der Cast-Daten:', error);
        }
      };

      loadCast();
      
      // Prüfe ob in "Meine Liste"
      setIsInMyList(netflixFeatures.isInMyList(videoData.id, type));
      
      // Lade Bewertung
      setUserRating(netflixFeatures.getRating(videoData.id, type));
    }
  }, [videoData, type]);

  const handleMyListToggle = () => {
    if (isInMyList) {
      netflixFeatures.removeFromMyList(videoData.id, type);
      setIsInMyList(false);
    } else {
      netflixFeatures.addToMyList({
        ...videoData,
        media_type: type
      });
      setIsInMyList(true);
    }
  };

  const handleRating = (rating) => {
    netflixFeatures.setRating(videoData.id, type, rating);
    setUserRating(rating);
  };

  if (!videoData) return null;

  const releaseYear = type === 'tv' 
    ? new Date(videoData.first_air_date).getFullYear()
    : new Date(videoData.release_date).getFullYear();

  const runtime = type === 'tv' 
    ? (episodeObj?.runtime || videoData.episode_run_time?.[0] || 45)
    : videoData.runtime;

  return (
    <div className="bg-[#181818] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Titel und Episode Info */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {videoData.title || videoData.name}
          </h1>
          
          {type === 'tv' && episodeObj && (
            <div className="text-xl text-gray-300 mb-4">
              Saison {selectedSeason} • Épisode {selectedEpisode}: {episodeObj.name}
            </div>
          )}

          {/* Bewertung und Jahr */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              <span className="text-lg font-medium">
                {videoData.vote_average?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-gray-400">({videoData.vote_count} votes)</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <FaCalendarAlt />
              <span>{releaseYear}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <FaClock />
              <span>{runtime}min</span>
            </div>

            {videoData.adult && (
              <span className="bg-red-600 px-2 py-1 text-xs rounded">18+</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleMyListToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isInMyList 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <FaPlus />
              {isInMyList ? 'Dans ma liste' : 'Ajouter à ma liste'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRating('up')}
                className={`p-2 rounded-full border transition-colors ${
                  userRating === 'up'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <FaThumbsUp />
              </button>
              
              <button
                onClick={() => handleRating('down')}
                className={`p-2 rounded-full border transition-colors ${
                  userRating === 'down'
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <FaThumbsDown />
              </button>
            </div>

            <button className="p-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors">
              <FaShare />
            </button>
          </div>
        </div>

        {/* Zwei-Spalten Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt - 2/3 */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-3">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed">
                {type === 'tv' && episodeObj 
                  ? episodeObj.overview || videoData.overview
                  : videoData.overview
                }
              </p>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cast.map((actor) => (
                    <Link
                      key={actor.id}
                      to={`/person/${actor.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={actor.profile_path 
                          ? getImageUrl(actor.profile_path, 'w185')
                          : '/placeholder-profile.jpg'
                        }
                        alt={actor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{actor.name}</div>
                        <div className="text-sm text-gray-400 truncate">{actor.character}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {videoData.genres && videoData.genres.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {videoData.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seitenleiste - 1/3 */}
          <div className="space-y-6">
            {/* Serie-spezifische Infos */}
            {type === 'tv' && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Informations sur la série</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créateur:</span>
                    <span>{videoData.created_by?.[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saisons:</span>
                    <span>{videoData.number_of_seasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Épisodes:</span>
                    <span>{videoData.number_of_episodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span>{videoData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Première diffusion:</span>
                    <span>{new Date(videoData.first_air_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Film-spezifische Infos */}
            {type === 'movie' && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Informations sur le film</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Réalisateur:</span>
                    <span>À charger</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget:</span>
                    <span>{videoData.budget ? `$${(videoData.budget / 1000000).toFixed(1)}M` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recettes:</span>
                    <span>{videoData.revenue ? `$${(videoData.revenue / 1000000).toFixed(1)}M` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sortie:</span>
                    <span>{new Date(videoData.release_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Länder */}
            {videoData.production_countries && videoData.production_countries.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Pays de production</h4>
                <div className="flex flex-wrap gap-1">
                  {videoData.production_countries.map((country, index) => (
                    <span key={index} className="text-sm text-gray-300">
                      {country.name}
                      {index < videoData.production_countries.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sprachen */}
            {videoData.spoken_languages && videoData.spoken_languages.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Langues</h4>
                <div className="flex flex-wrap gap-1">
                  {videoData.spoken_languages.map((lang, index) => (
                    <span key={index} className="text-sm text-gray-300">
                      {lang.name}
                      {index < videoData.spoken_languages.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPageInfo; 